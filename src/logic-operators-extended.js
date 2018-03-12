/*
  =====================================
  ADD CONDITIONAL OPERATORS (@mildmojo)
  =====================================

  Adds conditional logic operators:
    - !== (not equal to)
    - && (and)
    - || (or)
    - &&! (and not)
    - ||! (or not)

  Examples: candlecount > 5 && haslighter == 1
            candlecount > 5 && papercount > 1 && isIndoors
            haslighter == 1 || hasmatches == 1
            candlecount > 5 && candlecount !== 666
            candlecount > 5 &&! droppedlighter
            droppedlighter ||! hasmatches

  NOTE: The combining operators (&&, ||, &&!, ||!) have lower precedence than
        all other math and comparison operators, so it might be hard to write
        tests that mix and match these new operators and have them evaluate
        correctly. If you're using multiple `&&` and `||` operators in one
        condition, be sure to test every possibility to make sure it behaves
        the way you want.
*/

kitsyInit();

(function(globals) {
  'use strict';

  kitsy.inject('operatorMap.set("-", subExp);',
    'operatorMap.set("!==", notEqExp);',
    'operatorMap.set("&&", andExp);',
    'operatorMap.set("||", orExp);',
    'operatorMap.set("&&!", andNotExp);',
    'operatorMap.set("||!", orNotExp);');
  kitsy.inject('var operatorSymbols = ["-", "+", "/", "*", "<=", ">=", "<", ">", "=="];',
    'operatorSymbols.unshift("!==", "&&", "||", "&&!", "||!");');

  globals.andExp = function andExp(environment,left,right,onReturn) {
    right.Eval(environment,function(rVal){
      left.Eval(environment,function(lVal){
        onReturn( lVal && rVal );
      });
    });
  };

  globals.orExp = function orExp(environment,left,right,onReturn) {
    right.Eval(environment,function(rVal){
      left.Eval(environment,function(lVal){
        onReturn( lVal || rVal );
      });
    });
  };

  globals.notEqExp = function notEqExp(environment,left,right,onReturn) {
    right.Eval(environment,function(rVal){
      left.Eval(environment,function(lVal){
        onReturn( lVal !== rVal );
      });
    });
  };

  globals.andNotExp = function andNotExp(environment,left,right,onReturn) {
    right.Eval(environment,function(rVal){
      left.Eval(environment,function(lVal){
        onReturn( lVal && !rVal );
      });
    });
  };

  globals.orNotExp = function orNotExp(environment,left,right,onReturn) {
    right.Eval(environment,function(rVal){
      left.Eval(environment,function(lVal){
        onReturn( lVal || !rVal );
      });
    });
  };

})(window);

/*
  ========================================
  KITSY - SCRIPT HOOKS TOOLKIT (@mildmojo)
  ========================================

  HOW TO USE:
    1. Paste this whole file in script tags at the bottom of your Bitsy
       exported game HTML, after the last /script> tag.
    2. Call `kitsyInit()` to make the `kitsy` object available.

  CODING WITH KITSY:
    kitsy.before(targetFuncName, beforeFn)
    kitsy.after(targetFuncName, afterFn)
    kitsy.inject(searchString, codeFragment1[, ...codefragmentN])

    For more info, see the documentation at:
    https://github.com/wiki/whatever

  Version: 1.0
  Bitsy Version: 4.5, 4.6
  License: WTFPL (do WTF you want)
*/

function kitsyInit() {
  var globals = window;

  // Allow multiple copies of this script to work in one HTML file.
  globals.queuedInjectScripts = globals.queuedInjectScripts || [];
  globals.queuedBeforeScripts = globals.queuedBeforeScripts || {};
  globals.queuedAfterScripts = globals.queuedAfterScripts || [];
  globals.superFuncs = globals.superFuncs || {};
  globals.injectsDone = globals.injectsDone || false;

  // Local aliases
  var queuedInjectScripts = globals.queuedInjectScripts;
  var queuedBeforeScripts = globals.queuedBeforeScripts;
  var queuedAfterScripts = globals.queuedAfterScripts;
  var superFuncs = globals.superFuncs;
  var injectsDone = globals.injectsDone;

  globals.kitsy = {
    inject: inject,
    before: before,
    after: after
  };

  // Examples: inject('names.sprite.set( name, id );', 'console.dir(names)');
  //           inject('names.sprite.set( name, id );', 'console.dir(names);', 'console.dir(sprite);');
  //           inject('names.sprite.set( name, id );', ['console.dir(names)', 'console.dir(sprite);']);
  function inject(searchString, codeFragments) {
    var args = [].slice.call(arguments);
    codeFragments = _flatten(args.slice(1));

    queuedInjectScripts.push({
      searchString: searchString,
      codeFragments: codeFragments
    });
  }

  // Ex: before('load_game', function run() { alert('Loading!'); });
  //     before('show_text', function run(text) { return text.toUpperCase(); });
  //     before('show_text', function run(text, done) { done(text.toUpperCase()); });
  function before(targetFuncName, beforeFn) {
    queuedBeforeScripts[targetFuncName] = queuedBeforeScripts[targetFuncName] || [];
    queuedBeforeScripts[targetFuncName].push(beforeFn);
  }

  // Ex: after('load_game', function run() { alert('Loaded!'); });
  function after(targetFuncName, afterFn) {
    queuedAfterScripts.push({
      targetFuncName: targetFuncName,
      runFunc: afterFn
    });
  }

  // IMPLEMENTATION ============================================================

  var oldStartFunc = startExportedGame;
  globals.startExportedGame = function doAllInjections() {
    // Only do this once.
    globals.startExportedGame = oldStartFunc;

    if (injectsDone) {
      return oldStartFunc();
    }
    globals.injectsDone = true;

    // Rewrite scripts and hook everything up.
    doInjects();
    hookBefores();
    hookAfters();

    // Start the game. If original `startExportedGame` wasn't overwritten, call it.
    if (startExportedGame === oldStartFunc) {
      oldStartFunc.apply(this, arguments);
    } else {
      startExportedGame.apply(this, arguments);
    }
  };

  function doInjects() {
    queuedInjectScripts.forEach(function(injectScript) {
      _inject(injectScript.searchString, injectScript.codeFragments);
    });
    _reinitEngine();
  }

  function hookBefores() {
    Object.keys(queuedBeforeScripts).forEach(function(targetFuncName) {
      var superFn = globals[targetFuncName];
      var beforeFuncs = queuedBeforeScripts[targetFuncName];

      globals[targetFuncName] = function() {
        var self = this;
        var args = [].slice.call(arguments);
        var i = 0;
        runBefore.call(self);

        // Iterate thru sync & async functions. Run each, finally run original.
        function runBefore() {
          // Update args if provided.
          if (arguments.length > 0) {
            args = [].slice.call(arguments);
          }

          // All outta before functions? Finish by running the original.
          if (i === beforeFuncs.length) {
            return superFn.apply(self, args);
          }

          // Assume before funcs that accept more args than the original are
          // async and accept a callback as an additional argument.
          if (beforeFuncs[i].length > superFn.length) {
            beforeFuncs[i++].apply(self, args.concat(runBefore));
          } else {
            var newArgs = beforeFuncs[i++].apply(self, args) || args;
            setTimeout(function() { runBefore.apply(self, newArgs); }, 0);
          }
        }
      };
    });
  }

  function hookAfters() {
    queuedAfterScripts.forEach(function(afterScript) {
      _after(afterScript.targetFuncName, afterScript.runFunc);
    });
  }

  function _inject(searchString, codeToInject) {
    var args = [].slice.call(arguments);
    codeToInject = _flatten(args.slice(1)).join('');

    // find the relevant script tag
    var scriptTags = document.getElementsByTagName('script');
    var scriptTag;
    var code;
    for (var i = 0; i < scriptTags.length; ++i) {
      scriptTag = scriptTags[i];
      var matchesSearch = scriptTag.textContent.indexOf(searchString) !== -1;
      var isCurrentScript = scriptTag === document.currentScript;
      if (matchesSearch && !isCurrentScript) {
        code = scriptTag.textContent;
        break;
      }
    }

    // error-handling
    if (!code) {
      throw 'Couldn\'t find "' + searchString + '" in script tags';
    }

    // modify the content
    code = code.replace(searchString, searchString + codeToInject);

    // replace the old script tag with a new one using our modified code
    var newScriptTag = document.createElement('script');
    newScriptTag.textContent = code;
    scriptTag.insertAdjacentElement('afterend', newScriptTag);
    scriptTag.remove();
  }

  function _after(targetFuncName, afterFn) {
    var superFn = globals[targetFuncName];

    globals[targetFuncName] = function() {
      superFn.apply(this, arguments);
      afterFn.apply(this, arguments);
    };
  }

  function _reinitEngine() {
    // recreate the script and dialog objects so that they'll be
    // referencing the code with injections instead of the original
    globals.scriptModule = new Script();
    globals.scriptInterpreter = scriptModule.CreateInterpreter();

    globals.dialogModule = new Dialog();
    globals.dialogRenderer = dialogModule.CreateRenderer();
    globals.dialogBuffer = dialogModule.CreateBuffer();
  }

  function _flatten(list) {
    if (!Array.isArray(list)) {
      return list;
    }

    return list.reduce(function(fragments, arg) {
      return fragments.concat(_flatten(arg));
    }, []);
  }

  return globals.kitsy;
}
// End of logic operators mod

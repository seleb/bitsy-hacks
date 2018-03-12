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

    kitsy.before(targetFuncName, beforeFn)
      targetFuncName (string): Name of the global function you want your code
        to run before.

      beforeFn (function): A function to run. This function should take the same
        arguments as the original function.

      Use this function to register your own code to run before a Bitsy built-in
      function each time it's called. For example, if you wanted to modify Bitsy
      game data as it's loaded, you could write:

      kitsy.before('load_game', function run(game_data, startWithTitle) {
        var newGameData = game_data.replace('midnight', '12 AM');
        return [newGameData, startWithTitle];
      });

      In that example, the `run` function returns an array, so the values in the
      array will replace the parameters sent to the original `load_game`
      function. If you don't return anything, the original `load_game` will be
      called with the original `game_data, startWithTitle` parameters.

      If your `run` function is asynchronous, add an extra parameter to its
      argument list and Kitsy will provide a callback for you to signal when
      your code has finished. If you call the callback with parameters, they'll
      replace parameters to the original function as above.

      kitsy.before('load_game', function run(game_data, startWithTitle, done) {
        fetch('http://example.com')
          .then(function(response) {
            done(response.text(), startWithTitle);
          });
      });


    kitsy.after(targetFuncName, afterFn)
      targetFuncName (string): Name of the global function you want your code
        to run after.

      afterFn (function): A function to run. This function should take the same
        arguments as the original function.

      Use this function to register your own code to run after a Bitsy built-in
      function each time it's called. For example, if you wanted to pop up an
      alertbox every time the player exits a room, you could write:

      kitsy.after('onExitDialog', function run() {
        alert('Player exited.');
      });

      You might use this to clean up game state or play a sound on certain game
      events or send gameplay stats to an analytics provider.


    kitsy.inject(searchString, codeFragment1[, ...codefragmentN])
      searchString (string): A snippet of source code you want to find inside a
        script tag. Your code fragments will be inserted IMMEDIATELY after the
        end of this string, if found.

      codeFragment (string): Javascript code to inject. You can provide as many
        code fragment parameters as you want, they'll all be strung together
        before they're injected.

      Use this function to perform surgery on the Bitsy code. It's a search-and-
      insert. Use sparingly. Best used to install new dialog functions, new
      operators, or expose internal variables globally.

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

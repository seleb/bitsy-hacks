/**
🔀
@file logic-operators-extended
@summary adds conditional logic operators
@version 1.0.2
@author @mildmojo

@description
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
(function (bitsy) {
'use strict';

bitsy = bitsy && bitsy.hasOwnProperty('default') ? bitsy['default'] : bitsy;

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
*/

/*helper used to inject code into script tags based on a search string*/
function inject(searchString, codeToInject) {
	var args = [].slice.call(arguments);
	codeToInject = flatten(args.slice(1)).join('');

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

/**
 * Helper for getting an array with unique elements 
 * @param  {Array} array Original array
 * @return {Array}       Copy of array, excluding duplicates
 */
function unique(array) {
	return array.filter(function (item, idx) {
		return array.indexOf(item) === idx;
	});
}

function flatten(list) {
	if (!Array.isArray(list)) {
		return list;
	}

	return list.reduce(function (fragments, arg) {
		return fragments.concat(flatten(arg));
	}, []);
}

/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@version 2.2.2
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
HOW TO USE:
  import {before, after, inject, addDialogTag, addDeferredDialogTag} from "./helpers/kitsy-script-toolkit";

  before(targetFuncName, beforeFn);
  after(targetFuncName, afterFn);
  inject(searchString, codeFragment1[, ...codefragmentN]);
  addDialogTag(tagName, dialogFn);
  addDeferredDialogTag(tagName, dialogFn);

  For more info, see the documentation at:
  https://github.com/seleb/bitsy-hacks/wiki/Coding-with-kitsy
*/


// Examples: inject('names.sprite.set( name, id );', 'console.dir(names)');
//           inject('names.sprite.set( name, id );', 'console.dir(names);', 'console.dir(sprite);');
//           inject('names.sprite.set( name, id );', ['console.dir(names)', 'console.dir(sprite);']);
function inject$1(searchString, codeFragments) {
	var kitsy = kitsyInit();
	var args = [].slice.call(arguments);
	codeFragments = flatten(args.slice(1));

	kitsy.queuedInjectScripts.push({
		searchString: searchString,
		codeFragments: codeFragments
	});
}

function kitsyInit() {
	// return already-initialized kitsy
	if (bitsy.kitsy) {
		return bitsy.kitsy;
	}

	// Initialize kitsy
	bitsy.kitsy = {
		queuedInjectScripts: [],
		queuedBeforeScripts: {},
		queuedAfterScripts: {}
	};

	var oldStartFunc = bitsy.startExportedGame;
	bitsy.startExportedGame = function doAllInjections() {
		// Only do this once.
		bitsy.startExportedGame = oldStartFunc;

		// Rewrite scripts and hook everything up.
		doInjects();
		applyAllHooks();

		// Start the game
		bitsy.startExportedGame.apply(this, arguments);
	};

	return bitsy.kitsy;
}


function doInjects() {
	bitsy.kitsy.queuedInjectScripts.forEach(function (injectScript) {
		inject(injectScript.searchString, injectScript.codeFragments);
	});
	_reinitEngine();
}

function applyAllHooks() {
	var allHooks = unique(Object.keys(bitsy.kitsy.queuedBeforeScripts).concat(Object.keys(bitsy.kitsy.queuedAfterScripts)));
	allHooks.forEach(applyHook);
}

function applyHook(functionName) {
	var superFn = bitsy[functionName];
	var superFnLength = superFn.length;
	var functions = [];
	// start with befores
	functions = functions.concat(bitsy.kitsy.queuedBeforeScripts[functionName] || []);
	// then original
	functions.push(superFn);
	// then afters
	functions = functions.concat(bitsy.kitsy.queuedAfterScripts[functionName] || []);

	// overwrite original with one which will call each in order
	bitsy[functionName] = function () {
		var args = [].slice.call(arguments);
		var i = 0;
		runBefore.apply(this, arguments);

		// Iterate thru sync & async functions. Run each, finally run original.
		function runBefore() {
			// All outta functions? Finish
			if (i === functions.length) {
				return;
			}

			// Update args if provided.
			if (arguments.length > 0) {
				args = [].slice.call(arguments);
			}

			if (functions[i].length > superFnLength) {
				// Assume funcs that accept more args than the original are
				// async and accept a callback as an additional argument.
				functions[i++].apply(this, args.concat(runBefore.bind(this)));
			} else {
				// run synchronously
				var newArgs = functions[i++].apply(this, args) || args;
				runBefore.apply(this, newArgs);
			}
		}
	};
}

function _reinitEngine() {
	// recreate the script and dialog objects so that they'll be
	// referencing the code with injections instead of the original
	bitsy.scriptModule = new bitsy.Script();
	bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();

	bitsy.dialogModule = new bitsy.Dialog();
	bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
	bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();
}



inject$1('operatorMap.set("-", subExp);',
	'operatorMap.set("&&", andExp);',
	'operatorMap.set("||", orExp);',
	'operatorMap.set("&&!", andNotExp);',
	'operatorMap.set("||!", orNotExp);',
	'operatorMap.set("!==", notEqExp);');
inject$1('var operatorSymbols = ["-", "+", "/", "*", "<=", ">=", "<", ">", "=="];',
	'operatorSymbols.unshift("!==", "&&", "||", "&&!", "||!");');

bitsy.andExp = function andExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal && rVal);
		});
	});
};

bitsy.orExp = function orExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal || rVal);
		});
	});
};

bitsy.notEqExp = function notEqExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal !== rVal);
		});
	});
};

bitsy.andNotExp = function andNotExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal && !rVal);
		});
	});
};

bitsy.orNotExp = function orNotExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal || !rVal);
		});
	});
};
// End of logic operators mod

}(window));

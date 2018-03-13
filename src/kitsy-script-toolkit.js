/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@version 1.0.1
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
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
*/
import bitsy from "bitsy";
import {
	unique,
	flatten,
	inject as utilsInject
} from "./utils.js";


// Examples: inject('names.sprite.set( name, id );', 'console.dir(names)');
//           inject('names.sprite.set( name, id );', 'console.dir(names);', 'console.dir(sprite);');
//           inject('names.sprite.set( name, id );', ['console.dir(names)', 'console.dir(sprite);']);
export function inject(searchString, codeFragments) {
	var kitsy = kitsyInit();
	var args = [].slice.call(arguments);
	codeFragments = flatten(args.slice(1));

	kitsy.queuedInjectScripts.push({
		searchString: searchString,
		codeFragments: codeFragments
	});
}

// Ex: before('load_game', function run() { alert('Loading!'); });
//     before('show_text', function run(text) { return text.toUpperCase(); });
//     before('show_text', function run(text, done) { done(text.toUpperCase()); });
export function before(targetFuncName, beforeFn) {
	var kitsy = kitsyInit();
	kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
	kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
}

// Ex: after('load_game', function run() { alert('Loaded!'); });
export function after(targetFuncName, afterFn) {
	var kitsy = kitsyInit();
	kitsy.queuedAfterScripts[targetFuncName] = kitsy.queuedAfterScripts[targetFuncName] || [];
	kitsy.queuedAfterScripts[targetFuncName].push(afterFn);
}

function kitsyInit() {
	// return already-initialized kitsy
	if (bitsy.kitsy) {
		return bitsy.kitsy;
	}

	// Initialize kitsy
	bitsy.kitsy = {
		inject: inject,
		before: before,
		after: after,
		queuedInjectScripts: [],
		queuedBeforeScripts: [],
		queuedAfterScripts: []
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
		utilsInject(injectScript.searchString, injectScript.codeFragments);
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
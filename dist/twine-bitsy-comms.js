/**
💱
@file twine bitsy comms
@summary interprocess communication for twine and bitsy
@license MIT
@version 1.1.7
@requires 5.4
@author Sean S. LeBlanc

@description
Provides a method of easily integrating bitsy games into Twine games.
Variables are automatically shared between the two engines,
and dialog commands are provided which allow basic Twine commands
to be executed from inside of a bitsy game.

Twine has multiple story formats which function in different ways,
and this hack requires integration code in both engines to work properly.
Integrations for all the default Twine story formats are provided:
	SugarCube v2 macro: https://github.com/seleb/bitsy-hacks/blob/master/src/twine-bitsy-comms/SugarCube-v2.js
	SugarCube v1 macro: https://github.com/seleb/bitsy-hacks/blob/master/src/twine-bitsy-comms/SugarCube-v1.js
	Harlowe (1 and 2) script: https://github.com/seleb/bitsy-hacks/blob/master/src/twine-bitsy-comms/Harlowe.js
	Snowman script: https://github.com/seleb/bitsy-hacks/blob/master/src/twine-bitsy-comms/Snowman.js
	Sugarcane/Responsive macro: https://github.com/seleb/bitsy-hacks/blob/master/src/twine-bitsy-comms/Sugarcane-Responsive.js
	Jonah macro: https://github.com/seleb/bitsy-hacks/blob/master/src/twine-bitsy-comms/Jonah.js

Feel free to request integrations for formats not provided here.

Dialog command list:
	(twinePlay "<Twine passage title>")
	(twinePlayNow "<Twine passage title>")
	(twineBack)
	(twineBackNow)
	(twineEval "<javascript directly evaluated in macro context>")
	(twineEvalNow "<javascript directly evaluated in macro context>")

Notes:
	- eval support is commented out by default in the Twine integrations
	- Snowman's history is handled differently from other formats;
	  see: https://twinery.org/forum/discussion/3141/adding-an-undo-button-to-snowman-1-0-2
	- shared variables have prefixed names by default to avoid accidental overwriting;
	  see the hackOptions below for details

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Copy-paste the relevant story format integration script into the Story JavaScript section of your Twine game
(optional)
3. Add `.bitsy { ... }` CSS to the Story Stylesheet of your Twine game
4. Edit the variable naming functions below as needed
*/
(function (bitsy) {
'use strict';
var hackOptions = {
	// how dialog variables will be named when they are sent out
	// default implementation is bitsy_<name>
	variableNameOut: function (name) {
		return 'bitsy_' + name;
	},
	// how item variables will be named when they are sent out
	// default implementation is bitsy_item_<name or id>
	// Note: items names in bitsy don't have to be unique,
	// so be careful of items overwriting each other if you use this!
	itemNameOut: function (id) {
		return 'bitsy_item_' + (bitsy.item[id].name || id);
	},
	// how dialog variables will be named when they are sent in
	// default implementation is twine_<name>
	variableNameIn: function (name) {
		return 'twine_' + name;
	},

	// the options below are for customizing the integration;
	// if you're using one of the provided integrations, you can safely ignore them

	// how info will be posted to external process
	// default implementation is for iframe postMessage-ing to parent page
	send: function (type, data) {
		window.parent.postMessage({
			type: type,
			data: data,
		}, '*');
	},
	// how info will be received from external process
	// default implementation is for parent page postMessage-ing into iframe
	receive: function () {
		window.addEventListener('message', function (event) {
			var type = event.data.type;
			var data = event.data.data;
			receiveMessage(type, data);
		}, false);
	},
};

bitsy = bitsy && Object.prototype.hasOwnProperty.call(bitsy, 'default') ? bitsy['default'] : bitsy;

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
*/

/*
Helper used to replace code in a script tag based on a search regex
To inject code without erasing original string, using capturing groups; e.g.
	inject(/(some string)/,'injected before $1 injected after')
*/
function inject(searchRegex, replaceString) {
	// find the relevant script tag
	var scriptTags = document.getElementsByTagName('script');
	var scriptTag;
	var code;
	for (var i = 0; i < scriptTags.length; ++i) {
		scriptTag = scriptTags[i];
		var matchesSearch = scriptTag.textContent.search(searchRegex) !== -1;
		var isCurrentScript = scriptTag === document.currentScript;
		if (matchesSearch && !isCurrentScript) {
			code = scriptTag.textContent;
			break;
		}
	}

	// error-handling
	if (!code) {
		throw new Error('Couldn\'t find "' + searchRegex + '" in script tags');
	}

	// modify the content
	code = code.replace(searchRegex, replaceString);

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

/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@version 4.0.1
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
HOW TO USE:
  import {before, after, inject, addDialogTag, addDeferredDialogTag} from "./helpers/kitsy-script-toolkit";

  before(targetFuncName, beforeFn);
  after(targetFuncName, afterFn);
  inject(searchRegex, replaceString);
  addDialogTag(tagName, dialogFn);
  addDeferredDialogTag(tagName, dialogFn);

  For more info, see the documentation at:
  https://github.com/seleb/bitsy-hacks/wiki/Coding-with-kitsy
*/


// Ex: inject(/(names.sprite.set\( name, id \);)/, '$1console.dir(names)');
function inject$1(searchRegex, replaceString) {
	var kitsy = kitsyInit();
	kitsy.queuedInjectScripts.push({
		searchRegex: searchRegex,
		replaceString: replaceString
	});
}

// Ex: before('load_game', function run() { alert('Loading!'); });
//     before('show_text', function run(text) { return text.toUpperCase(); });
//     before('show_text', function run(text, done) { done(text.toUpperCase()); });
function before(targetFuncName, beforeFn) {
	var kitsy = kitsyInit();
	kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
	kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
}

// Ex: after('load_game', function run() { alert('Loaded!'); });
function after(targetFuncName, afterFn) {
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
		inject(injectScript.searchRegex, injectScript.replaceString);
	});
	_reinitEngine();
}

function applyAllHooks() {
	var allHooks = unique(Object.keys(bitsy.kitsy.queuedBeforeScripts).concat(Object.keys(bitsy.kitsy.queuedAfterScripts)));
	allHooks.forEach(applyHook);
}

function applyHook(functionName) {
	var functionNameSegments = functionName.split('.');
	var obj = bitsy;
	while (functionNameSegments.length > 1) {
		obj = obj[functionNameSegments.shift()];
	}
	var lastSegment = functionNameSegments[0];
	var superFn = obj[lastSegment];
	var superFnLength = superFn ? superFn.length : 0;
	var functions = [];
	// start with befores
	functions = functions.concat(bitsy.kitsy.queuedBeforeScripts[functionName] || []);
	// then original
	if (superFn) {
		functions.push(superFn);
	}
	// then afters
	functions = functions.concat(bitsy.kitsy.queuedAfterScripts[functionName] || []);

	// overwrite original with one which will call each in order
	obj[lastSegment] = function () {
		var returnVal;
		var args = [].slice.call(arguments);
		var i = 0;

		function runBefore() {
			// All outta functions? Finish
			if (i === functions.length) {
				return returnVal;
			}

			// Update args if provided.
			if (arguments.length > 0) {
				args = [].slice.call(arguments);
			}

			if (functions[i].length > superFnLength) {
				// Assume funcs that accept more args than the original are
				// async and accept a callback as an additional argument.
				return functions[i++].apply(this, args.concat(runBefore.bind(this)));
			} else {
				// run synchronously
				returnVal = functions[i++].apply(this, args);
				if (returnVal && returnVal.length) {
					args = returnVal;
				}
				return runBefore.apply(this, args);
			}
		}

		return runBefore.apply(this, arguments);
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

// Rewrite custom functions' parentheses to curly braces for Bitsy's
// interpreter. Unescape escaped parentheticals, too.
function convertDialogTags(input, tag) {
	return input
		.replace(new RegExp('\\\\?\\((' + tag + '(\\s+(".+?"|.+?))?)\\\\?\\)', 'g'), function (match, group) {
			if (match.substr(0, 1) === '\\') {
				return '(' + group + ')'; // Rewrite \(tag "..."|...\) to (tag "..."|...)
			}
			return '{' + group + '}'; // Rewrite (tag "..."|...) to {tag "..."|...}
		});
}


function addDialogFunction(tag, fn) {
	var kitsy = kitsyInit();
	kitsy.dialogFunctions = kitsy.dialogFunctions || {};
	if (kitsy.dialogFunctions[tag]) {
		throw new Error('The dialog function "' + tag + '" already exists.');
	}

	// Hook into game load and rewrite custom functions in game data to Bitsy format.
	before('parseWorld', function (game_data) {
		return [convertDialogTags(game_data, tag)];
	});

	kitsy.dialogFunctions[tag] = fn;
}

function injectDialogTag(tag, code) {
	inject$1(
		/(var functionMap = new Map\(\);[^]*?)(this.HasFunction)/m,
		'$1\nfunctionMap.set("' + tag + '", ' + code + ');\n$2'
	);
}

/**
 * Adds a custom dialog tag which executes the provided function.
 * For ease-of-use with the bitsy editor, tags can be written as
 * (tagname "parameters") in addition to the standard {tagname "parameters"}
 * 
 * Function is executed immediately when the tag is reached.
 *
 * @param {string}   tag Name of tag
 * @param {Function} fn  Function to execute, with signature `function(environment, parameters, onReturn){}`
 *                       environment: provides access to SetVariable/GetVariable (among other things, see Environment in the bitsy source for more info)
 *                       parameters: array containing parameters as string in first element (i.e. `parameters[0]`)
 *                       onReturn: function to call with return value (just call `onReturn(null);` at the end of your function if your tag doesn't interact with the logic system)
 */
function addDialogTag(tag, fn) {
	addDialogFunction(tag, fn);
	injectDialogTag(tag, 'kitsy.dialogFunctions["' + tag + '"]');
}

/**
 * Adds a custom dialog tag which executes the provided function.
 * For ease-of-use with the bitsy editor, tags can be written as
 * (tagname "parameters") in addition to the standard {tagname "parameters"}
 * 
 * Function is executed after the dialog box.
 *
 * @param {string}   tag Name of tag
 * @param {Function} fn  Function to execute, with signature `function(environment, parameters){}`
 *                       environment: provides access to SetVariable/GetVariable (among other things, see Environment in the bitsy source for more info)
 *                       parameters: array containing parameters as string in first element (i.e. `parameters[0]`)
 */
function addDeferredDialogTag(tag, fn) {
	addDialogFunction(tag, fn);
	bitsy.kitsy.deferredDialogFunctions = bitsy.kitsy.deferredDialogFunctions || {};
	var deferred = bitsy.kitsy.deferredDialogFunctions[tag] = [];
	injectDialogTag(tag, 'function(e, p, o){ kitsy.deferredDialogFunctions["' + tag + '"].push({e:e,p:p}); o(null); }');
	// Hook into the dialog finish event and execute the actual function
	after('onExitDialog', function () {
		while (deferred.length) {
			var args = deferred.shift();
			bitsy.kitsy.dialogFunctions[tag](args.e, args.p, args.o);
		}
	});
	// Hook into the game reset and make sure data gets cleared
	after('clearGameData', function () {
		deferred.length = 0;
	});
}

/**
 * Adds two custom dialog tags which execute the provided function,
 * one with the provided tagname executed after the dialog box,
 * and one suffixed with 'Now' executed immediately when the tag is reached.
 *
 * i.e. helper for the (exit)/(exitNow) pattern.
 *
 * @param {string}   tag Name of tag
 * @param {Function} fn  Function to execute, with signature `function(environment, parameters){}`
 *                       environment: provides access to SetVariable/GetVariable (among other things, see Environment in the bitsy source for more info)
 *                       parameters: array containing parameters as string in first element (i.e. `parameters[0]`)
 */
function addDualDialogTag(tag, fn) {
	addDialogTag(tag + 'Now', function (environment, parameters, onReturn) {
		fn(environment, parameters);
		onReturn(null);
	});
	addDeferredDialogTag(tag, fn);
}





var sending = true;

// hook up incoming listener
hackOptions.receive();

function receiveMessage(type, data) {
	switch (type) {
	case 'variables':
		var state = sending;
		sending = false;
		Object.entries(data).forEach(function (entry) {
			var name = entry[0];
			var value = entry[1];
			bitsy.scriptInterpreter.SetVariable(hackOptions.variableNameIn(name), value);
		});
		sending = state;
		break;
	default:
		console.warn('Unhandled message from outside Bitsy:', type, data);
		break;
	}
}

// hook up outgoing var/item change listeners
function sendVariable(name, value) {
	hackOptions.send('variable', {
		name: name,
		value: value,
	});
}
after('onVariableChanged', function (name) {
	if (sending) {
		sendVariable(hackOptions.variableNameOut(name), bitsy.scriptInterpreter.GetVariable(name));
	}
});
after('onInventoryChanged', function (id) {
	if (sending) {
		sendVariable(hackOptions.itemNameOut(id), bitsy.player().inventory[id]);
	}
});

// say when bitsy has started
// and initialize variables
after('startExportedGame', function () {
	bitsy.scriptInterpreter.GetVariableNames().forEach(function (name) {
		sendVariable(hackOptions.variableNameOut(name), bitsy.scriptInterpreter.GetVariable(name));
	});
	Object.values(bitsy.item).forEach(function (item) {
		sendVariable(hackOptions.itemNameOut(item.id), 0);
	});
	hackOptions.send('start', bitsy.title);
});

// hook up dialog commands
[
	'eval',
	'play',
	'back',
].forEach(function (command) {
	function doCommand(environment, parameters) {
		hackOptions.send(command, parameters[0]);
	}
	addDualDialogTag('twine' + command.substr(0, 1).toUpperCase() + command.substr(1), doCommand);
});

}(window));

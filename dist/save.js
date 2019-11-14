/**
💾
@file save
@summary save/load your game
@license MIT
@version 1.0.6
@requires 5.4
@author Sean S. LeBlanc

@description
Introduces save/load functionality.

Includes:
	- data that may be saved/loaded:
		- current room/position within room
		- inventory/items in rooms
		- dialog variables
		- dialog position
	- basic autosave
	- dialog tags:
		- (save): saves game
		- (load ""): loads game; parameter is text to show as title on load
		- (clear): clears saved game
		- (saveNow)/(loadNow)/(clearNow): instant varieties of above tags

Notes:
	- Storage is implemented through browser localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
	  Remember to clear storage while working on a game, otherwise loading may prevent you from seeing your changes!
	  You can use the `clearOnStart` option to do this for you when testing.
	- This hack only tracks state which could be modified via vanilla bitsy features,
	  i.e. compatability with other hacks that modify state varies;
	  you may need to modify save/load to include/exclude things for compatability.
	  (feel free to ask for help tailoring these to your needs!)
	- There is only one "save slot"; it would not be too difficult to implement more,
	  but it adds a lot of complexity that most folks probably don't need.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	// when to save/load
	autosaveInterval: Infinity, // time in milliseconds between autosaves (never autosaves if Infinity)
	loadOnStart: true, // if true, loads save when starting
	clearOnEnd: false, // if true, deletes save when restarting after reaching an ending
	clearOnStart: false, // if true, deletes save when page is loaded (mostly for debugging)
	// what to save/load
	position: true, // if true, saves which room the player is in, and where they are in the room
	variables: true, // if true, saves dialog variables (note: does not include item counts)
	items: true, // if true, saves player inventory (i.e. item counts) and item placement in rooms
	dialog: true, // if true, saves dialog position (for sequences etc)
	key: 'snapshot', // where in localStorage to save/load data
};

bitsy = bitsy && bitsy.hasOwnProperty('default') ? bitsy['default'] : bitsy;

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
		throw 'Couldn\'t find "' + searchRegex + '" in script tags';
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
	inject$1(
		/(var functionMap = new Map\(\);)/,
		'$1functionMap.set("' + tag + '", kitsy.dialogFunctions.' + tag + ');'
	);
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
	inject$1(
		/(var functionMap = new Map\(\);)/,
		'$1functionMap.set("' + tag + '", function(e, p, o){ kitsy.deferredDialogFunctions.' + tag + '.push({e:e,p:p}); o(null); });'
	);
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





function save() {
	var snapshot = {};
	if (hackOptions.position) {
		snapshot.room = bitsy.curRoom;
		snapshot.x = bitsy.player().x;
		snapshot.y = bitsy.player().y;
	}
	if (hackOptions.items) {
		snapshot.inventory = bitsy.player().inventory;
		snapshot.items = Object.entries(bitsy.room).map(function (room) {
			return [room[0], room[1].items];
		});
	}
	if (hackOptions.variables) {
		snapshot.variables = bitsy.scriptInterpreter.GetVariableNames().map(function (variable) {
			return [variable, bitsy.scriptInterpreter.GetVariable(variable)];
		});
	}
	if (hackOptions.dialog) {
		snapshot.sequenceIndices = bitsy.saveHack.sequenceIndices;
	}
	localStorage.setItem(hackOptions.key, JSON.stringify(snapshot));
}

function load() {
	var snapshot = localStorage.getItem(hackOptions.key);
	// if there's no save, abort load
	if (!snapshot) {
		return;
	}
	snapshot = JSON.parse(snapshot);

	if (hackOptions.position) {
		if (snapshot.room) {
			bitsy.curRoom = bitsy.player().room = snapshot.room;
		}
		if (snapshot.x && snapshot.y) {
			bitsy.player().x = snapshot.x;
			bitsy.player().y = snapshot.y;
		}
	}
	if (hackOptions.items) {
		if (snapshot.inventory) {
			bitsy.player().inventory = snapshot.inventory;
		}
		if (snapshot.items) {
			snapshot.items.forEach(function (entry) {
				bitsy.room[entry[0]].items = entry[1];
			});
		}
	}
	if (hackOptions.variables && snapshot.variables) {
		snapshot.variables.forEach(function (variable) {
			bitsy.scriptInterpreter.SetVariable(variable[0], variable[1]);
		});
	}
	if (hackOptions.dialog && snapshot.sequenceIndices) {
		bitsy.saveHack.sequenceIndices = snapshot.sequenceIndices;
	}
}

function clear() {
	localStorage.removeItem(hackOptions.key);
}

function nodeKey(node) {
	var key = node.key = node.key || node.options.map(function (option) {
		return option.Serialize();
	}).join('\n');
	return key;
}
// setup global needed for saving/loading dialog progress
bitsy.saveHack = {
	sequenceIndices: {},
	saveSeqIdx: function (node, index) {
		var key = nodeKey(node);
		bitsy.saveHack.sequenceIndices[key] = index;
	},
	loadSeqIdx: function (node) {
		var key = nodeKey(node);
		return bitsy.saveHack.sequenceIndices[key];
	},
};

// use saved index to eval/calc next index if available
inject(/(ptions\[index\].Eval)/g, 'ptions[window.saveHack.loadSeqIdx(this) || index].Eval');
inject(/var next = index \+ 1;/g, 'var next = (window.saveHack.loadSeqIdx(this) || index) + 1;');
// save index on changes
inject(/(index = next);/g, '$1,window.saveHack.saveSeqIdx(this, next);');
inject(/(\tindex = 0);/g, '$1,window.saveHack.saveSeqIdx(this, 0);');

// hook up autosave
var autosaveInterval;
after('onready', function () {
	if (hackOptions.autosaveInterval < Infinity) {
		clearInterval(autosaveInterval);
		autosaveInterval = setInterval(save, hackOptions.autosaveInterval);
	}
});

// hook up autoload
after('onready', function () {
	if (hackOptions.loadOnStart) {
		load();
	}
});

// hook up clear on end
before('reset_cur_game', function () {
	if (hackOptions.clearOnEnd) {
		if (bitsy.isEnding) {
			clear();
		}
	}
});

// hook up clear on start
before('startExportedGame', function () {
	if (hackOptions.clearOnStart) {
		clear();
	}
});

// hook up dialog functions
function dialogLoad(environment, parameters) {
	bitsy.reset_cur_game();
	bitsy.dialogBuffer.EndDialog();
	bitsy.startNarrating(parameters[0] || '');
}
addDualDialogTag('save', save);
addDualDialogTag('load', dialogLoad);
addDualDialogTag('clear', clear);

exports.hackOptions = hackOptions;

}(this.hacks.save = this.hacks.save || {}, window));

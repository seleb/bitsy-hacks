/**
💾
@file save
@summary save/load your game
@license MIT
@version 1.0.0
@author Sean S. LeBlanc

@description
Introduces save/load functionality.

Includes:
	- autosave option: automatically saves every X milliseconds
	- load on start option: automatically loads save on start
	- (save "") dialog tag: manually saves game (parameter doesn't do anything, but is required)
	- (load "") dialog tag: manually loads game (parameter is text to show as title on load)

Notes:
	- To simplify things, save/load dialog tags execute immediately
	  (i.e. they act like {exitNow}, not {exit})
	- Storage is implemented through browser localStorage
	  Remember to clear storage while working on a game,
	  otherwise loading will prevent you from seeing your changes!
	- Compatability with other hacks untested

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
(function (bitsy) {
'use strict';
var hackOptions = {
	autosaveInterval: Infinity, // time in milliseconds between autosaves (never saves if Infinity)
	loadOnStart: true, // if true, loads save when starting
	resetOnEnd: false // if true, deletes save when restarting after reaching an ending
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
@version 3.0.0
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

// Rewrite custom functions' parentheses to curly braces for Bitsy's
// interpreter. Unescape escaped parentheticals, too.
function convertDialogTags(input, tag) {
	return input
		.replace(new RegExp('\\\\?\\((' + tag + '\\s+(".+?"|.+?))\\\\?\\)', 'g'), function(match, group){
			if(match.substr(0,1) === '\\') {
				return '('+ group + ')'; // Rewrite \(tag "..."|...\) to (tag "..."|...)
			}
			return '{'+ group + '}'; // Rewrite (tag "..."|...) to {tag "..."|...}
		});
}


function addDialogFunction(tag, fn) {
	var kitsy = kitsyInit();
	kitsy.dialogFunctions = kitsy.dialogFunctions || {};
	if (kitsy.dialogFunctions[tag]) {
		throw new Error('The dialog function "' + tag + '" already exists.');
	}

	// Hook into game load and rewrite custom functions in game data to Bitsy format.
	before('load_game', function (game_data, startWithTitle) {
		return [convertDialogTags(game_data, tag), startWithTitle];
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
	}
};

if (hackOptions.autosaveInterval < Infinity) {
	setInterval(() => {
		save();
	}, hackOptions.autosaveInterval);
}

if (hackOptions.loadOnStart) {
	after('onready', function () {
		load();
	});
}

if (hackOptions.resetOnEnd) {
	after('reset_cur_game', function () {
		if (bitsy.isEnding) {
			localStorage.removeItem('snapshot');
		}
	});
}

function save() {
	var snapshot = {
		basic: {
			sprite: bitsy.sprite,
			room: bitsy.room,
			curRoom: bitsy.curRoom,
			variable: bitsy.variable
		},
		variableMap: Array.from(bitsy.saveHack.variableMap.entries())
			.reduce(function (result, entry) {
				result[entry[0]] = entry[1];
				return result;
			}, {}),
		sequenceIndices: bitsy.saveHack.sequenceIndices
	};
	localStorage.setItem('snapshot', JSON.stringify(snapshot));
}

function load() {
	var snapshot = localStorage.getItem('snapshot');
	// if there's no save, abort load
	if (!snapshot) {
		return;
	}

	snapshot = JSON.parse(snapshot);
	// basic props can be assigned directly
	Object.assign(bitsy, snapshot.basic);

	// variableMap needs to preserve its reference
	bitsy.saveHack.variableMap.clear();
	Object.entries(snapshot.variableMap).forEach(function (entry) {
		bitsy.saveHack.variableMap.set(entry[0], entry[1]);
	});

	// easier to assign this separately than deal with a deep-merge for basic
	bitsy.saveHack.sequenceIndices = snapshot.sequenceIndices;
}

// add dialog functions
addDialogTag('load', function (environment, parameters, onReturn) {
	bitsy.stopGame();
	bitsy.clearGameData();
	bitsy.load_game(bitsy.curGameData.replace(/^(.*)$/m, parameters[0]));
	onReturn(null);
});
addDialogTag('save', function (environment, parameters, onReturn) {
	save();
	onReturn(null);
});

// expose variable map
inject(/(var variableMap = new Map\(\);)/, '$1window.saveHack.variableMap = variableMap;');

// use saved index to eval/calc next index if available
inject(/(ptions\[index\].Eval)/g, `ptions[window.saveHack.loadSeqIdx(this) || index].Eval`);
inject(/var next = index \+ 1;/g, `var next = (window.saveHack.loadSeqIdx(this) || index) + 1;`);
// save index on changes
inject(/(index = next);/g, `$1,window.saveHack.saveSeqIdx(this, next);`);
inject(/(\tindex = 0);/g, `$1,window.saveHack.saveSeqIdx(this, 0);`);

}(window));

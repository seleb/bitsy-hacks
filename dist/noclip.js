/**
📎
@file noclip
@summary walk through wall tiles, sprites, items, exits, and endings
@license MIT
@version 2.0.3
@author Sean S. LeBlanc

@description
Adds a "noclip" command, which allows player to walk through wall tiles, sprites, items, exits, and endings.
Also adds a room cycle command for use with noclip.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Press 'space' to toggle noclip
3. Press 'r' while noclip is enabled to cycle rooms
*/
(function (bitsy) {
'use strict';

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



var noClip = false;

// save references to existing functions
var originalGetSpriteAt = bitsy.getSpriteAt;
var originalIsWallLeft = bitsy.isWallLeft;
var originalIsWallRight = bitsy.isWallRight;
var originalIsWallUp = bitsy.isWallUp;
var originalIsWallDown = bitsy.isWallDown;
var originalGetExit = bitsy.getExit;
var originalGetEnding = bitsy.getEnding;
var originalGetItemIndex = bitsy.getItemIndex;

var toggleNoClip = function () {
	noClip = !noClip;
	if (noClip) {
		// disable functions
		bitsy.getSpriteAt = bitsy.isWallLeft = bitsy.isWallRight = bitsy.isWallUp = bitsy.isWallDown = bitsy.getExit = bitsy.getEnding = function () {
			return null;
		};
		bitsy.getItemIndex = function () {
			return -1;
		};
		console.log('noclip enabled');
	} else {
		// re-enable functions
		bitsy.getSpriteAt = originalGetSpriteAt;
		bitsy.isWallLeft = originalIsWallLeft;
		bitsy.isWallRight = originalIsWallRight;
		bitsy.isWallUp = originalIsWallUp;
		bitsy.isWallDown = originalIsWallDown;
		bitsy.getExit = originalGetExit;
		bitsy.getEnding = originalGetEnding;
		bitsy.getItemIndex = originalGetItemIndex;
		console.log('noclip disabled');
	}
};

after('onready', function () {
	bitsy.isPlayerEmbeddedInEditor = true; // HACK: prevent keydown from consuming all key events

	// add key handler
	document.addEventListener('keypress', function (e) {
		if (e.keyCode === 114 && noClip) {
			// cycle to next room on 'r' if no-clipping
			e.preventDefault();
			var k = Object.keys(bitsy.room);
			bitsy.curRoom = bitsy.player().room = k[(k.indexOf(bitsy.player().room) + 1) % k.length];
		} else if (e.keyCode === bitsy.key.space) {
			// toggle noclip on 'space'
			e.preventDefault();
			toggleNoClip();
		}
	});
});

}(window));

/**
🎭
@file replace drawing
@summary add name-tags to replace drawings when the game is loading
@license MIT
@version 1.0.1
@requires 6.3
@author Elkie Nova

@description
add this tag to the name of the drawing you want to replace:
'#draw(TYPE,id)'
where 'TYPE' is TIL/SPR/ITM as displayed in bitsy data, and 'id' is what follows
said type right after, e.g. avatar's type is 'SPR', and avatar's id is 'A'
so if you would want to replace some drawing with the drawing of the avatar,
you would use '#draw(SPR,A)'

the point is to make it possible to have more convenient visuals when working
in the bitsy editor, then let the hack replace them with what you want
to show up in the actual game.
this hack is useful for working with stuff like invisible items, sprites, and walls,
and for creating helpful editor gizmos in 3d hack bitsies where you can have objects
whose visual properties in 3d are not fully reflected by their drawings in bitsy editor.
with this hack you can give them illustrative drawings to help you work in
the editor, while making them use the right drawings when rendered.

note, that this hack only replaces visuals, it doesn't change the behavior.
for example, this is what would happen if you added '#draw(ITM,0)' to bitsy cat's name:
after you have exported the game, added the hack and run it, bitsy cat would appear
as a cup of tea, but would say it's a cat, and you wouldn't be able to pick it up
like an item, because it would still function as a sprite!

HOW TO USE:
1. add '#draw(TYPE,id)' tag to the names of the drawings you want to replace when the game loads
2. copy-paste this script into a script tag after the bitsy source
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



after('parseWorld', function () {
	[].concat(Object.values(bitsy.item), Object.values(bitsy.tile), Object.values(bitsy.sprite)).forEach(function (drawing) {
		// replace drawings marked with the #draw(TYPE,id) tag
		var name = drawing.name || '';
		var tag = name.match(/#draw\((TIL|SPR|ITM),([a-zA-Z0-9]+)\)/);
		if (tag) {
			var map;
			// tag[1] is the first capturing group, it can be either TIL, SPR, or ITM
			switch (tag[1]) {
				case 'TIL':
					map = bitsy.tile;
					break;
				case 'SPR':
					map = bitsy.sprite;
					break;
				case 'ITM':
					map = bitsy.item;
					break;
				default:
					break;
			}
			// tag[2] is the second capturing group which returns drawing id
			var id = tag[2];
			var newDrawing = map[id];
			if (newDrawing) {
				drawing.drw = newDrawing.drw;
				drawing.animation.frameCount = newDrawing.animation.frameCount;
				drawing.animation.isAnimated = newDrawing.animation.isAnimated;
				drawing.col = newDrawing.col;
			} else {
				console.error(`couldn't replace ${drawing.name}! there is no '${tag[1]} ${id}'`);
			}
		}
	});
});

}(window));

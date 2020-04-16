/**
🏠
@file edit room from dialog
@summary modify the content of a room from dialog
@license MIT
@version 1.0.1
@requires Bitsy Version: 6.1
@author Dana Holdampf

@description
This hack allows you to add, remove, or reposition tiles, sprites, and items.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Use the following dialog tags to edit a room's tiles, sprites, or items

-- DRAW DIALOG TAG REFERENCE -----------------------------------

{draw "type, source, x, y, room"}
{drawNow "type, source, x, y, room"}
{drawBox "type, source, x1, y1, x2, y2 room"}
{drawBoxNow "type, source, x1, y1, x2, y2 room"}
{drawAll "type, source, room"}
{drawAllNow "type, source, room"}

Information:
- "draw" creates a tile, item, or sprite at a location in a room. Can be a fixed position, or relative to the player.
- "drawBox" is as above, but draws tiles, items, or sprites in a box/line, defined by a top left and bottom right corner.
- "drawAll" is as above, but affects an entire room.
- Adding "Now" causes it to draw immediately, rather than waiting until the dialog ends.

Parameters:
- type:		Type of room contents to draw (TIL, ITM, or SPR)
			Tile (TIL): Each location can have only one Tile. Drawing over an existing tile replaces it.
			Item (ITM): Multiple items can exist in one spot, but only the most recent item is picked up.
			Sprite (SPR): Only one copy of each Sprite can exist at a time; redrawing a sprite moves it.
- source:	The ID (number/letter) of the tile, item, or sprite to draw.
- x, y:		The x and y coordinates you want to draw at, from 0-15.
- x1, y1:	(For drawBox only) The x and y coordinates of the top left tile you want to draw on, from 0-15.
- x2, y2:	(For drawBox only) The x and y coordinates of the bottom right tile you want to draw on, from 0-15.
			Put + or - before any coordinate to draw relative to the player's current position. (ex. +10, -2, etc.).
			Leave any coordinate blank (or use +0) to use the player's current X (or Y) position. (If blank, still add commas)
- room:		The ID (number/letter) of the room you're drawing in. (Refer to Game Data tab for Room IDs)
			Leave blank to default to modifying the room the player is currently in.

-- ERASE DIALOG TAG REFERENCE ----------------------------------

{erase "type, target, x, y, room"}
{eraseNow "type, target, x, y, room"}
{eraseBox "type, target, x1, y1, x2, y2 room"}
{eraseBoxNow "type, target, x1, y1, x2, y2 room"}
{eraseAll "type, target, room"}
{eraseAllNow "type, target, room"}

Information:
- "erase" Removes tiles, items, or sprites at a location in a room. Can be a fixed position, or relative to the player.
- "eraseBox" is as above, but erases tiles, items, or sprites in a box/line, defined by a top left and bottom right corner.
- "eraseAll" is as above, but affects an entire room.
- Adding "Now" causes it to erase immediately, rather than waiting until the dialog ends.

Parameters:
- type:		Type of room contents to erase (ANY, TIL, ITM, or SPR)
			Anything (ANY): Erasing anything will target all valid Tiles, Items, and Sprites.
			Tile (TIL): Erasing a Tile causes that location to be empty and walkable.
			Item (ITM): Erasing an Item affects all valid target items, even if there are more than one.
			Sprite (SPR): Erasing a Sprite removes it from a room, but it will remember dialog progress, etc.
			Leaving this blank will default to targeting ANY. (If blank, still include commas)
- target:	The ID (number/letter) of the tile, item, or sprite to erase. Other objects will not be erased.
			Leave this blank, or set this to "ANY", to target all tiles, items, and/or sprites. (If blank, still include commas)
- x, y:		The x and y coordinates you want to erase at, from 0-15.
- x1, y1:	(For eraseBox only) The x and y coordinates of the top left tile you want to erase at, from 0-15.
- x2, y2:	(For eraseBox only) The x and y coordinates of the bottom right tile you want to erase at, from 0-15.
			Leave X (or Y) blank to use the player's current X (or Y) position. (If blank, still include commas)
			Put + or - before the number to erase relative to the player's current position. (ex. +10, -2, etc.).
- room:		The ID (number/letter) of the room you're erasing in. (Refer to Game Data tab for Room IDs)
			Leave blank to default to modifying the room the player is currently in.

-- REPLACE DIALOG TAG REFERENCE --------------------------------

{replace "targetType, targetId, newType, newId, x, y, room"}
{replaceNow "targetType, targetId, newType, newId, x, y, room"}
{replaceBox "targetType, targetId, newType, newId, x1, y1, x2, y2 room"}
{replaceBoxNow "targetType, targetId, newType, newId, x1, y1, x2, y2 room"}
{replaceAll "targetType, targetId, newType, newId, room"}
{replaceAllNow "targetType, targetId, newType, newId, room"}

Information:
- "replace" Combines erase and draw. Removes tiles, items, or sprites at a location in a room, and replaces each with something new.
- "replaceBox" is as above, but replaces tiles, items, or sprites in a box/line, defined by a top left and bottom right corner.
- "replaceAll" is as above, but affects an entire room.
- Adding "Now" causes it to erase immediately, rather than waiting until the dialog ends.

Parameters:
- targetType:	Type of room contents to target for replacing (ANY, TIL, ITM, or SPR).
				Anything (ANY): Targetting anything will target all valid Tiles, Items, and Sprites.
				Tile (TIL): Replacing a Tile will remove it, leaving behind walkable space.
				Item (ITM): Replacing an Item affects all valid items, even if there are more than one.
				Sprite (SPR): Replacing a Sprite removes it from a room, but it will remember dialog progress, etc.
				Leaving this blank will default to targeting ANY. (If blank, still include commas)
- targetId:		The ID (number/letter) of the tile, item, or sprite to replace. Other objects will not be replaced.
				Leave this blank, or set this to "ANY", to target all tiles, items, and/or sprites. (If blank, still include commas)
- newType:		As above, but defines the type of room contents to replace the target with (TIL, ITM, or SPR).
				Note: This must be defined, and cannot be left blank.
- newId:		As above, but defines the ID (number/letter) of the tile, item, or sprite to replace the target with.
				Note: This must be defined, and cannot be left blank.
- x, y:			The x and y coordinates you want to replace at, from 0-15.
- x1, y1:		(For replaceBox only) The x and y coordinates of the top left tile you want to replace at, from 0-15.
- x2, y2:		(For replaceBox only) The x and y coordinates of the bottom right tile you want to replace at, from 0-15.
				Leave X (or Y) blank to use the player's current X (or Y) position. (If blank, still include commas)
				Put + or - before the number to replace relative to the player's current position. (ex. +10, -2, etc.).
- room:			The ID (number/letter) of the room you're replacing in. (Refer to Game Data tab for Room IDs)
				Leave blank to default to modifying the room the player is currently in.

-- COPY DIALOG TAG REFERENCE -----------------------------------

{copy "type, target, copyX, copyY, copyRoom, pasteX, pasteY, pasteRoom"}
{copyNow "type, target, copyX, copyY, copyRoom, pasteX, pasteY, pasteRoom"}
{copyBox "type, target, copyX1, copyY1, copyX2, copyY2, copyRoom, pasteX, pasteY, pasteRoom"}
{copyBoxNow "type, target, copyX1, copyY1, copyX2, copyY2, copyRoom, pasteX, pasteY, pasteRoom"}
{copyAll "type, target, copyRoom, pasteRoom"}
{copyAllNow "type, target, copyRoom, pasteRoom"}

Information:
- "copy" find tiles, items, or sprites at a location in a room, and duplicates each at a new location (may be in a different room).
- "copyBox" is as above, but copies tiles, items, or sprites in a box/line, defined by a top left and bottom right corner.
- "copyAll" is as above, but affects an entire room.
- Adding "Now" causes it to copy immediately, rather than waiting until the dialog ends.

Parameters:
- type:				Type of room contents to target for copying (ANY, TIL, ITM, or SPR).
					Anything (ANY): Targetting anything will copy all valid Tiles, Items, and Sprites.
					Tile (TIL): Each location can have only one Tile. Copying over an existing tile replaces it.
					Item (ITM): Multiple items can exist in one spot, and all valid items will be copied.
					Sprite (SPR): Only one copy of each Sprite can exist at a time; copying a sprite moves it.
					Leaving this blank will default to targeting ANY. (If blank, still include commas)
- target:			The ID (number/letter) of the tile, item, or sprite to copy. Other objects will not be copied.
					Leave this blank, or set this to "ANY", to target all tiles, items, and/or sprites. (If blank, still include commas)
- copyX, copyY:		The x and y coordinates you want to copy from, from 0-15.
- copyX1, copyY1:	(For copyBox only) The x and y coordinates of the top left tile you want to copy from, from 0-15.
- copyX2, copyY2:	(For copyBox only) The x and y coordinates of the bottom right tile you want to copy from, from 0-15.
					Leave X (or Y) blank to use the player's current X (or Y) position. (If blank, still include commas)
					Put + or - before the number to replace relative to the player's current position. (ex. +10, -2, etc.).
- copyRoom:			The ID (number/letter) of the room you're copying from. (Refer to Game Data tab for Room IDs)
					Leave blank to default to copy from the room the player is currently in.
- pasteX, pasteY:	The x and y coordinates you want to paste copied tiles too, from 0-15.
					For copyBox, this position marks the upper-left corner of the pasted box.
- pasteRoom:		As above, but marks the ID (number/letter) of the room you're pasting into.
					Leave blank to default to paste to the room the player is currently in.
**/
(function (bitsy) {
'use strict';

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



// Draws an Item, Sprite, or Tile at a location in a room
// {draw "mapId, sourceId, xPos, yPos, roomID"}
// {drawNow "mapId, sourceId, xPos, yPos, roomID"}
addDialogTag('drawNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	drawAt(params[0], params[1], params[2], params[3], params[4]);
	onReturn(null);
});
addDeferredDialogTag('draw', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	drawAt(params[0], params[1], params[2], params[3], params[4]);
});

// As above, but affects a box area, between two corners.
// {drawBox "mapId, sourceId, x1, y1, x2, y2, roomID"}
// {drawBoxNow "mapId, sourceId, x1, y1, x2, y2, roomID"}
addDialogTag('drawBoxNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	drawBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
	onReturn(null);
});
addDeferredDialogTag('drawBox', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	drawBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
});

// As above, but affects an entire room.
// {drawAll "mapId, sourceId, roomID"}
// {drawAllNow "mapId, sourceId, roomID"}
addDialogTag('drawAllNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	drawBoxAt(params[0], params[1], 0, 0, 15, 15, params[2]);
	onReturn(null);
});
addDeferredDialogTag('drawAll', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	drawBoxAt(params[0], params[1], 0, 0, 15, 15, params[2]);
});

// Removes Items, Sprites, and/or Tiles at a location in a room
// {erase "mapId, targetId, xPos, yPos, roomID"}
// {eraseNow "mapId, targetId, xPos, yPos, roomID"}
addDialogTag('eraseNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	eraseAt(params[0], params[1], params[2], params[3], params[4]);
});
addDeferredDialogTag('erase', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	eraseAt(params[0], params[1], params[2], params[3], params[4]);
});

// As above, but affects a box area, between two corners.
// {eraseBox "mapId, targetId, x1, y1, x2, y2, roomID"}
// {eraseBoxNow "mapId, targetId, x1, y1, x2, y2, roomID"}
addDialogTag('eraseBoxNow', function (environment, parameters, onReturn) { 
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	eraseBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
	onReturn(null);
});
addDeferredDialogTag('eraseBox', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	eraseBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
});

// As above, but affects an entire room.
// {eraseAll "mapId, targetId, roomID"}
// {eraseAllNow "mapId, targetId, roomID"}
addDialogTag('eraseAllNow', function (environment, parameters, onReturn) { 
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	eraseBoxAt(params[0], params[1], 0, 0, 15, 15, params[2]);
	onReturn(null);
});
addDeferredDialogTag('eraseAll', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	eraseBoxAt(params[0], params[1], 0, 0, 15, 15, params[2]);
});

// Converts instances of target Item, Sprite, or Tile at a location in a room into something new
// {replace "targetMapId, targetId, newMapId, newId, xPos, yPos, roomID"}
// {replaceNow "targetMapId, targetId, newMapId, newId, xPos, yPos, roomID"}
addDialogTag('replaceNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	replaceAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
});
addDeferredDialogTag('replace', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	replaceAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
});

// As above, but affects a box area between two corners.
// {replaceBox "targetMapId, targetId, newMapId, newId, x1, y1, x2, y2, roomID"}
// {replaceBoxNow "targetMapId, targetId, newMapId, newId, x1, y1, x2, y2, roomID"}
addDialogTag('replaceBoxNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	replaceBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8]);
});
addDeferredDialogTag('replaceBox', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	replaceBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8]);
});

// As above, but affects an entire room.
// {replaceAll "targetMapId, targetId, newMapId, roomID"}
// {replaceAllNow "targetMapId, targetId, newMapId, newId, roomID"}
addDialogTag('replaceAllNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	replaceBoxAt(params[0], params[1], params[2], params[3], 0, 0, 15, 15, params[4]);
});
addDeferredDialogTag('replaceAll', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	replaceBoxAt(params[0], params[1], params[2], params[3], 0, 0, 15, 15, params[4]);
});

// Duplicates Items, Sprites, and/or Tiles from one location in a room to another
// {copy "mapId, targetId, copyX, copyY, copyRoom, pasteX, pasteY, pasteRoom"}
// {copyNow "mapId, targetId, copyX, copyY, copyRoom, pasteX, pasteY, pasteRoom"}
addDialogTag('copyNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	copyAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7]);
	onReturn(null);
});
addDeferredDialogTag('copy', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	copyAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7]);
});

// As above, but copies a box area between two corners, and pastes at a new spot designating the upper-left corner
// NOTE: positioning the paste coordinates out of bounds will only draw the section overlapping with the room.
// {copyBox "mapId, targetId, copyX1, copyY1, copyX2, copyY2, copyRoom, pasteX, pasteY, pasteRoom"}
// {copyBoxNow "mapId, targetId, copyX1, copyY1, copyX2, copyY2, copyRoom, pasteX, pasteY, pasteRoom"}
addDialogTag('copyBoxNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	copyBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], params[9]);
	onReturn(null);
});
addDeferredDialogTag('copyBox', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	copyBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], params[9]);
});

// As above, but affects an entire room.
// {copyAll "mapId, targetId, copyRoom, pasteRoom"}
// {copyAllNow "mapId, targetId, copyRoom, pasteRoom"}
addDialogTag('copyAllNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	copyBoxAt(params[0], params[1], 0, 0, 15, 15, params[3], 0, 0, params[4]);
	onReturn(null);
});
addDeferredDialogTag('copyAll', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {undefined};
	copyBoxAt(params[0], params[1], 0, 0, 15, 15, params[3], 0, 0, params[4]);
});

function drawAt (mapId, sourceId, xPos, yPos, roomId) {
	// Trim and sanitize Map ID / Type parameter, and return if not provided.
	if (mapId == undefined) {
		console.log("CAN'T DRAW. DRAW TYPE IS UNDEFINED. TIL, ITM, OR SPR EXPECTED.");
		return;
	}
	else {
		mapId = mapId.toString().trim();
		if (mapId == "" || !(mapId.toUpperCase() == "TIL" || mapId.toUpperCase() == "ITM" || mapId.toUpperCase() == "SPR")) {
			console.log("CAN'T DRAW. UNEXPECTED DRAW TYPE ("+mapId+"). TIL, ITM, OR SPR EXPECTED.");
			return;
		}
	}

	// Trim and sanitize Source ID parameter, and return if not provided
	if (sourceId == undefined) {
		console.log("CAN'T DRAW. SOURCE ID IS UNDEFINED. TILE, ITEM, OR SPRITE ID EXPECTED.");
		return;
	}
	else {
		sourceId = sourceId.toString().trim();
		if (sourceId == "") {
			console.log("CAN'T DRAW. NO SOURCE ID GIVEN. TILE, ITEM, OR SPRITE ID EXPECTED.");
			return;
		}
	}

	// Trim and sanitize X Position parameter, and set relative positions, even if omitted.
	if (xPos == undefined) {
		xPos = player().x;
	}
	else {
		xPos = xPos.toString().trim();
		if (xPos == "" ) { xPos = player().x; }
		else if (xPos.includes("+")) { xPos = player().x + parseInt(xPos.substring(1)); }
		else if (xPos.includes("-")) { xPos = player().x - parseInt(xPos.substring(1)); }
	}
	if (xPos < 0 || xPos > 15) {
		console.log("CAN'T DRAW. X POSITION ("+xPos+") OUT OF BOUNDS. 0-15 EXPECTED.");
		return;
	}

	// Trim and sanitize Y Position parameter, and set relative positions, even if omitted
	if (yPos == undefined) {
		yPos = player().y;
	}
	else {
		yPos = yPos.toString().trim();
		if (yPos == "" ) { yPos = player().y; }
		else if (yPos.includes("+")) { yPos = player().y + parseInt(yPos.substring(1)); }
		else if (yPos.includes("-")) { yPos = player().y - parseInt(yPos.substring(1)); }
	}
	if (yPos < 0 || yPos > 15) {
		console.log("CAN'T DRAW. Y POSITION ("+yPos+") OUT OF BOUNDS. 0-15 EXPECTED.");
		return;
	}
	
	// Trim and sanitize Room ID parameter, and set to current room if omitted
	if (roomId == undefined) {
		roomId = curRoom;
	}
	else {
		roomId = roomId.toString().trim();
		if (roomId == "" ) { roomId = curRoom; }
		else if (room[roomId] == undefined) {
			console.log("CAN'T DRAW. ROOM ID ("+roomId+") NOT FOUND.");
			return;
		}
	}

	//console.log ("DRAWING "+mapId+" "+sourceId+" at "+xPos+","+yPos+"(Room "+roomId+")");

	if (mapId.toUpperCase() == "TIL") {
		if (tile[sourceId] != undefined) {
			room[roomId].tilemap[yPos][xPos] = sourceId;
		}
	}
	else if (mapId.toUpperCase() == "ITM") {
		if (item[sourceId] != undefined) {
			var newItem = {
				id: sourceId,
				x: xPos,
				y: yPos
			};
			room[roomId].items.push(newItem);
		}
	}
	else if (mapId.toUpperCase() == "SPR") {
		if (sprite[sourceId] != undefined) {
			if (sprite[sourceId].id == "A") {
				console.log("CAN'T TARGET AVATAR. SKIPPING.");
			}
			else if (room[roomId] != undefined) {
				sprite[sourceId].room = roomId;
				sprite[sourceId].x = xPos;
				sprite[sourceId].y = yPos;
			}
		}
	}
}

function drawBoxAt (mapId, sourceId, x1, y1, x2, y2, roomId) {
	
	// Trim and sanitize X and Y Positions, and set relative positions if omitted.
	if (x1 == undefined) {
		x1 = player().x;
	}
	else {
		x1 = x1.toString().trim();
		if (x1 == "" ) { x1 = player().x; }
		else if (x1.includes("+")) { x1 = player().x + parseInt(x1.substring(1)); }
		else if (x1.includes("-")) { x1 = player().x - parseInt(x1.substring(1)); }
	}
	if (x1 < 0 || x1 > 15) {
		console.log("CLAMPING X1 POSITION. XPOS ("+x1+") OUT OF BOUNDS. 0-15 EXPECTED.");
		x1 = Math.max(0, Math.min(x1, 15));
	}
	// X2
	if (x2 == undefined) {
		x2 = player().x;
	}
	else {
		x2 = x2.toString().trim();
		if (x2 == "" ) { x2 = player().x; }
		else if (x2.includes("+")) { x2 = player().x + parseInt(x2.substring(1)); }
		else if (x2.includes("-")) { x2 = player().x - parseInt(x2.substring(1)); }
	}
	if (x2 < 0 || x2 > 15) {
		console.log("CLAMPING X2 POSITION. xPos ("+x2+") OUT OF BOUNDS. 0-15 EXPECTED.");
		x2 = Math.max(0, Math.min(x2, 15));
	}
	// Y1
	if (y1 == undefined) {
		y1 = player().y;
	}
	else {
		y1 = y1.toString().trim();
		if (y1 == "" ) { y1 = player().y; }
		else if (y1.includes("+")) { y1 = player().y + parseInt(y1.substring(1)); }
		else if (y1.includes("-")) { y1 = player().y - parseInt(y1.substring(1)); }
	}
	if (y1 < 0 || y1 > 15) {
		console.log("CLAMPING Y1 POSITION. XPOS ("+y1+") OUT OF BOUNDS. 0-15 EXPECTED.");
		y1 = Math.max(0, Math.min(y1, 15));
	}
	// Y2
	if (y2 == undefined) {
		y2 = player().y;
	}
	else {
		y2 = y2.toString().trim();
		if (y2 == "" ) { y2 = player().y; }
		else if (y2.includes("+")) { y2 = player().y + parseInt(y2.substring(1)); }
		else if (y2.includes("-")) { y2 = player().y - parseInt(y2.substring(1)); }
	}
	if (y2 < 0 || y2 > 15) {
		console.log("CLAMPING Y2 POSITION. xPos ("+y2+") OUT OF BOUNDS. 0-15 EXPECTED.");
		y2 = Math.max(0, Math.min(y2, 15));
	}

	// Calculate which coordinates are the actual top left and bottom right.
	var topPos = Math.min(y1, y2);
	var leftPos = Math.min(x1, x2);
	var bottomPos = Math.max(y1, y2);
	var rightPos = Math.max(x1, x2);

	for (var xPos = leftPos; xPos <= rightPos; xPos++) {
		for (var yPos = topPos; yPos <= bottomPos; yPos++) {
			drawAt(mapId, sourceId, xPos, yPos, roomId);
		}
	}
}

function eraseAt (mapId, targetId, xPos, yPos, roomId) {
	// Trim and sanitize Map ID / Type parameter, and use any if not provided.
	if (mapId == undefined) {
		//console.log("ERASE TYPE IS UNDEFINED. DEFAULTING TO ANY (TIL, ITM, OR SPR).");
		mapId = "ANY";
	}
	else {
		mapId = mapId.toString().trim();
		if (mapId == "" || !(mapId.toUpperCase() == "ANY" || mapId.toUpperCase() == "TIL" || mapId.toUpperCase() == "ITM" || mapId.toUpperCase() == "SPR")) {
			//console.log("UNEXPECTED ERASE TYPE ("+mapId+"). DEFAULTING TO ANY (TIL, ITM, OR SPR).");
			mapId = "ANY";
		}
	}

	// Trim and sanitize Target ID parameter, and use any if not provided
	if (targetId == undefined) {
		//console.log("TARGET ID UNDEFINED. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
		targetId = "ANY";
	}
	else {
		targetId = targetId.toString().trim();
		if (targetId == "") {
			//console.log("NO TARGET ID GIVEN. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
			targetId = "ANY";
		}
		//mapId = (mapId != "" || mapId.toUpperCase() != "ANY") ? mapId : "ANY";
	}

	// Trim and sanitize X Position parameter, and set relative positions, even if omitted.
	if (xPos == undefined) {
		xPos = player().x;
	}
	else {
		xPos = xPos.toString().trim();
		if (xPos == "" ) { xPos = player().x; }
		else if (xPos.includes("+")) { xPos = player().x + parseInt(xPos.substring(1)); }
		else if (xPos.includes("-")) { xPos = player().x - parseInt(xPos.substring(1)); }
	}
	if (xPos < 0 || xPos > 15) {
		console.log("CAN'T DRAW. X POSITION ("+xPos+") OUT OF BOUNDS. 0-15 EXPECTED.");
		return;
	}

	// Trim and sanitize Y Position parameter, and set relative positions, even if omitted
	if (yPos == undefined) {
		yPos = player().y;
	}
	else {
		yPos = yPos.toString().trim();
		if (yPos == "" ) { yPos = player().y; }
		else if (yPos.includes("+")) { yPos = player().y + parseInt(yPos.substring(1)); }
		else if (yPos.includes("-")) { yPos = player().y - parseInt(yPos.substring(1)); }
	}
	if (yPos < 0 || yPos > 15) {
		console.log("CAN'T DRAW. Y POSITION ("+yPos+") OUT OF BOUNDS. 0-15 EXPECTED.");
		return;
	}
	
	// Trim and sanitize Room ID parameter, and set to current room if omitted
	if (roomId == undefined) {
		roomId = curRoom;
	}
	else {
		roomId = roomId.toString().trim();
		if (roomId == "" ) { roomId = curRoom; }
		else if (room[roomId] == undefined) {
			console.log("CAN'T DRAW. ROOM ID ("+roomId+") NOT FOUND.");
			return;
		}
	}

	//console.log ("REMOVING "+mapId+" "+targetId+" at "+xPos+","+yPos+"(Room "+roomId+")");
	
	// If TIL or undefined.
	if (mapId.toUpperCase() != "ITM" && mapId.toUpperCase() != "SPR") {
		if (targetId == "ANY" || room[roomId].tilemap[yPos][xPos] == targetId) {
			room[roomId].tilemap[yPos][xPos] = "0";
		}
	}
	
	// If ITM or undefined.
	if (mapId.toUpperCase() != "TIL" && mapId.toUpperCase() != "SPR") {
		// Iterate backwards through items, to prevent issues with removed indexes
		for (var i = room[roomId].items.length-1; i >= 0; i--) {
			var targetItem = room[roomId].items[i];
			if (targetId == "ANY" || targetId == targetItem.id) {
				if (targetItem.x == xPos && targetItem.y == yPos) {
					room[roomId].items.splice(i, 1);
				}
			}
		}
	}
	
	// If SPR or undefined.
	if (mapId.toUpperCase() != "TIL" && mapId.toUpperCase() != "ITM") {
		if (targetId == "ANY") {
			for (i in sprite) {
				if (sprite[i].id == "A") {
					console.log("CAN'T TARGET AVATAR. SKIPPING.");
				}
				else if (sprite[i].room == roomId && sprite[i].x == xPos && sprite[i].y == yPos) {
					sprite[i].x = 0;
					sprite[i].y = 0;
					sprite[i].room = "default";
				}
			}
		}
		else if (sprite[targetId] != undefined) {
			if (sprite[targetId].id == "A") {
				console.log("CAN'T TARGET AVATAR. SKIPPING.");
			}
			else if (sprite[targetId].room == roomId && sprite[targetId].x == xPos && sprite[targetId].y == yPos) {
				sprite[targetId].x = 0;
				sprite[targetId].y = 0;
				sprite[targetId].room = "default";
			}
		}
	}
}

function eraseBoxAt (mapId, targetId, x1, y1, x2, y2, roomId) {
	// Trim and sanitize X and Y Positions, and set relative positions if omitted.
	if (x1 == undefined) {
		x1 = player().x;
	}
	else {
		x1 = x1.toString().trim();
		if (x1 == "" ) { x1 = player().x; }
		else if (x1.includes("+")) { x1 = player().x + parseInt(x1.substring(1)); }
		else if (x1.includes("-")) { x1 = player().x - parseInt(x1.substring(1)); }
	}
	if (x1 < 0 || x1 > 15) {
		console.log("CLAMPING X1 POSITION. XPOS ("+x1+") OUT OF BOUNDS. 0-15 EXPECTED.");
		x1 = Math.max(0, Math.min(x1, 15));
	}
	// X2
	if (x2 == undefined) {
		x2 = player().x;
	}
	else {
		x2 = x2.toString().trim();
		if (x2 == "" ) { x2 = player().x; }
		else if (x2.includes("+")) { x2 = player().x + parseInt(x2.substring(1)); }
		else if (x2.includes("-")) { x2 = player().x - parseInt(x2.substring(1)); }
	}
	if (x2 < 0 || x2 > 15) {
		console.log("CLAMPING X2 POSITION. xPos ("+x2+") OUT OF BOUNDS. 0-15 EXPECTED.");
		x2 = Math.max(0, Math.min(x2, 15));
	}
	// Y1
	if (y1 == undefined) {
		y1 = player().y;
	}
	else {
		y1 = y1.trim();
		if (y1 == "" ) { y1 = player().y; }
		else if (y1.includes("+")) { y1 = player().y + parseInt(y1.substring(1)); }
		else if (y1.includes("-")) { y1 = player().y - parseInt(y1.substring(1)); }
	}
	if (y1 < 0 || y1 > 15) {
		console.log("CLAMPING Y1 POSITION. XPOS ("+y1+") OUT OF BOUNDS. 0-15 EXPECTED.");
		y1 = Math.max(0, Math.min(y1, 15));
	}
	// Y2
	if (y2 == undefined) {
		y2 = player().y;
	}
	else {
		y2 = y2.toString().trim();
		if (y2 == "" ) { y2 = player().y; }
		else if (y2.includes("+")) { y2 = player().y + parseInt(y2.substring(1)); }
		else if (y2.includes("-")) { y2 = player().y - parseInt(y2.substring(1)); }
	}
	if (y2 < 0 || y2 > 15) {
		console.log("CLAMPING Y2 POSITION. xPos ("+y2+") OUT OF BOUNDS. 0-15 EXPECTED.");
		y2 = Math.max(0, Math.min(y2, 15));
	}

	// Calculate which coordinates are the actual top left and bottom right.
	var topPos = Math.min(y1, y2);
	var leftPos = Math.min(x1, x2);
	var bottomPos = Math.max(y1, y2);
	var rightPos = Math.max(x1, x2);

	for (var xPos = leftPos; xPos <= rightPos; xPos++) {
		for (var yPos = topPos; yPos <= bottomPos; yPos++) {
			eraseAt(mapId, targetId, xPos, yPos, roomId);
		}
	}
}

function replaceAt (targetMapId, targetId, newMapId, newId, xPos, yPos, roomId) {
	// Trim and sanitize Target Map ID / Type parameter, and use any if not provided.
	if (targetMapId == undefined) {
		//console.log("TARGET TYPE IS UNDEFINED. DEFAULTING TO ANY (TIL, ITM, OR SPR).");
		targetMapId = "ANY";
	}
	else {
		targetMapId = targetMapId.toString().trim();
		if (targetMapId == "" || !(targetMapId.toUpperCase() == "ANY" || targetMapId.toUpperCase() == "TIL" || targetMapId.toUpperCase() == "ITM" || targetMapId.toUpperCase() == "SPR")) {
			//console.log("UNEXPECTED TARGET TYPE ("+targetMapId+"). DEFAULTING TO ANY (TIL, ITM, OR SPR).");
			targetMapId = "ANY";
		}
	}

	// Trim and sanitize Target ID parameter, and use any if not provided
	if (targetId == undefined) {
		//console.log("TARGET ID UNDEFINED. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
		targetId = "ANY";
	}
	else {
		targetId = targetId.toString().trim();
		if (targetId == "") {
			//console.log("NO TARGET ID GIVEN. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
			targetId = "ANY";
		}
	}

	// Trim and sanitize New Map ID / Type parameter, and return if not provided.
	if (newMapId == undefined) {
		console.log("CANNOT REPLACE. REPLACING TYPE IS UNDEFINED. TIL, ITM, OR SPR EXPECTED.");
		return;
	}
	else {
		newMapId = newMapId.toString().trim();
		if (newMapId == "" || !(newMapId.toUpperCase() == "TIL" || newMapId.toUpperCase() == "ITM" || newMapId.toUpperCase() == "SPR")) {
			console.log("CANNOT REPLACE. UNEXPECTED REPLACING TYPE ("+newMapId+"). TIL, ITM, OR SPR EXPECTED.");
			return;
		}
	}

	// Trim and sanitize New Target ID parameter, and return if not provided
	if (newId == undefined) {
		console.log("CANNOT REPLACE. NEW TARGET ID UNDEFINED. VALID ID EXPECTED).");
		return;
	}
	else {
		newId = newId.toString().trim();
		if (newId == "") {
			console.log("CANNOT REPLACE. NO NEW TARGET ID GIVEN. VALID ID EXPECTED");
			return;
		}
	}

	// Trim and sanitize X Position parameter, and set relative positions, even if omitted.
	if (xPos == undefined) {
		xPos = player().x;
	}
	else {
		xPos = xPos.toString().trim();
		if (xPos == "" ) { xPos = player().x; }
		else if (xPos.includes("+")) { xPos = player().x + parseInt(xPos.substring(1)); }
		else if (xPos.includes("-")) { xPos = player().x - parseInt(xPos.substring(1)); }
	}
	if (xPos < 0 || xPos > 15) {
		console.log("CAN'T REPLACE. X POSITION ("+xPos+") OUT OF BOUNDS. 0-15 EXPECTED.");
		return;
	}

	// Trim and sanitize Y Position parameter, and set relative positions, even if omitted
	if (yPos == undefined) {
		yPos = player().y;
	}
	else {
		yPos = yPos.toString().trim();
		if (yPos == "" ) { yPos = player().y; }
		else if (yPos.includes("+")) { yPos = player().y + parseInt(yPos.substring(1)); }
		else if (yPos.includes("-")) { yPos = player().y - parseInt(yPos.substring(1)); }
	}
	if (yPos < 0 || yPos > 15) {
		console.log("CAN'T REPLACE. Y POSITION ("+yPos+") OUT OF BOUNDS. 0-15 EXPECTED.");
		return;
	}
	
	// Trim and sanitize Room ID parameter, and set to current room if omitted
	if (roomId == undefined) {
		roomId = curRoom;
	}
	else {
		roomId = roomId.toString().trim();
		if (roomId == "" ) { roomId = curRoom; }
		else if (room[roomId] == undefined) {
			console.log("CAN'T REPLACE. ROOM ID ("+roomId+") NOT FOUND.");
			return;
		}
	}

	//console.log ("REPLACING "+targetMapId+" "+targetId+" at "+xPos+","+yPos+"(Room "+roomId+")");
	//console.log ("REPLACING WITH "+newMapId+" "+newId);
	
	// If TIL or undefined.
	if (targetMapId.toUpperCase() != "ITM" && targetMapId.toUpperCase() != "SPR") {
		if (targetId == "ANY" || room[roomId].tilemap[yPos][xPos] == targetId) {
			room[roomId].tilemap[yPos][xPos] = "0";
			drawAt(newMapId, newId, xPos, yPos, roomId);
		}
	}
	
	// If ITM or undefined.
	if (targetMapId.toUpperCase() != "TIL" && targetMapId.toUpperCase() != "SPR") {
		// Iterate backwards through items, to prevent issues with removed indexes
		for (var i = room[roomId].items.length-1; i >= 0; i--) {
			var targetItem = room[roomId].items[i];
			if (targetId == "ANY" || targetId == targetItem.id) {
				if (targetItem.x == xPos && targetItem.y == yPos) {
					room[roomId].items.splice(i, 1);
					drawAt(newMapId, newId, xPos, yPos, roomId);
				}
			}
		}
	}
	
	// If SPR or undefined.
	if (targetMapId.toUpperCase() != "TIL" && targetMapId.toUpperCase() != "ITM") {
		if (targetId == "ANY") {
			for (i in sprite) {
				if (sprite[i].id == "A") {
					console.log("CAN'T TARGET AVATAR. SKIPPING.");
				}
				else if (sprite[i].room == roomId && sprite[i].x == xPos && sprite[i].y == yPos) {
					sprite[i].x = 0;
					sprite[i].y = 0;
					sprite[i].room = "default";
					drawAt(newMapId, newId, xPos, yPos, roomId);
				}
			}
		}
		else if (sprite[targetId] != undefined) {
			if (sprite[targetId] != "A" && sprite[targetId].room == roomId && sprite[targetId].x == xPos && sprite[targetId].y == yPos) {
				sprite[targetId].x = 0;
				sprite[targetId].y = 0;
				sprite[targetId].room = "default";
				drawAt(newMapId, newId, xPos, yPos, roomId);
			}
		}
	}
}

function replaceBoxAt (targetMapId, targetId, newMapId, newId, x1, y1, x2, y2, roomId) {
	// Trim and sanitize X and Y Positions, and set relative positions if omitted.
	if (x1 == undefined) {
		x1 = player().x;
	}
	else {
		x1 = x1.toString().trim();
		if (x1 == "" ) { x1 = player().x; }
		else if (x1.includes("+")) { x1 = player().x + parseInt(x1.substring(1)); }
		else if (x1.includes("-")) { x1 = player().x - parseInt(x1.substring(1)); }
	}
	if (x1 < 0 || x1 > 15) {
		console.log("CLAMPING X1 POSITION. XPOS ("+x1+") OUT OF BOUNDS. 0-15 EXPECTED.");
		x1 = Math.max(0, Math.min(x1, 15));
	}
	// X2
	if (x2 == undefined) {
		x2 = player().x;
	}
	else {
		x2 = x2.toString().trim();
		if (x2 == "" ) { x2 = player().x; }
		else if (x2.includes("+")) { x2 = player().x + parseInt(x2.substring(1)); }
		else if (x2.includes("-")) { x2 = player().x - parseInt(x2.substring(1)); }
	}
	if (x2 < 0 || x2 > 15) {
		console.log("CLAMPING X2 POSITION. xPos ("+x2+") OUT OF BOUNDS. 0-15 EXPECTED.");
		x2 = Math.max(0, Math.min(x2, 15));
	}
	// Y1
	if (y1 == undefined) {
		y1 = player().y;
	}
	else {
		y1 = y1.toString().trim();
		if (y1 == "" ) { y1 = player().y; }
		else if (y1.includes("+")) { y1 = player().y + parseInt(y1.substring(1)); }
		else if (y1.includes("-")) { y1 = player().y - parseInt(y1.substring(1)); }
	}
	if (y1 < 0 || y1 > 15) {
		console.log("CLAMPING Y1 POSITION. XPOS ("+y1+") OUT OF BOUNDS. 0-15 EXPECTED.");
		y1 = Math.max(0, Math.min(y1, 15));
	}
	// Y2
	if (y2 == undefined) {
		y2 = player().y;
	}
	else {
		y2 = y2.toString().trim();
		if (y2 == "" ) { y2 = player().y; }
		else if (y2.includes("+")) { y2 = player().y + parseInt(y2.substring(1)); }
		else if (y2.includes("-")) { y2 = player().y - parseInt(y2.substring(1)); }
	}
	if (y2 < 0 || y2 > 15) {
		console.log("CLAMPING Y2 POSITION. xPos ("+y2+") OUT OF BOUNDS. 0-15 EXPECTED.");
		y2 = Math.max(0, Math.min(y2, 15));
	}

	// Calculate which coordinates are the actual top left and bottom right.
	var topPos = Math.min(y1, y2);
	var leftPos = Math.min(x1, x2);
	var bottomPos = Math.max(y1, y2);
	var rightPos = Math.max(x1, x2);

	for (var xPos = leftPos; xPos <= rightPos; xPos++) {
		for (var yPos = topPos; yPos <= bottomPos; yPos++) {
			replaceAt(targetMapId, targetId, newMapId, newId, xPos, yPos, roomId);
		}
	}
}

function copyAt (mapId, targetId, copyXPos, copyYPos, copyRoomId, pasteXPos, pasteYPos, pasteRoomId) {
	// Trim and sanitize Target Map ID / Type parameter, and use any if not provided.
	if (mapId == undefined) {
		//console.log("TARGET TYPE IS UNDEFINED. DEFAULTING TO ANY (TIL, ITM, OR SPR).");
		mapId = "ANY";
	}
	else {
		mapId = mapId.toString().trim();
		if (mapId == "" || !(mapId.toUpperCase() == "ANY" || mapId.toUpperCase() == "TIL" || mapId.toUpperCase() == "ITM" || mapId.toUpperCase() == "SPR")) {
			//console.log("UNEXPECTED TARGET TYPE ("+mapId+"). DEFAULTING TO ANY (TIL, ITM, OR SPR).");
			mapId = "ANY";
		}
	}

	// Trim and sanitize Target ID parameter, and use any if not provided
	if (targetId == undefined) {
		//console.log("TARGET ID UNDEFINED. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
		targetId = "ANY";
	}
	else {
		targetId = targetId.toString().trim();
		if (targetId == "") {
			//console.log("NO TARGET ID GIVEN. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
			targetId = "ANY";
		}
	}

	// Trim and sanitize Copy Position parameters, and set relative positions, even if omitted.
	if (copyXPos == undefined) {
		copyXPos = player().x;
	}
	else {
		copyXPos = copyXPos.toString().trim();
		if (copyXPos == "" ) { copyXPos = player().x; }
		else if (copyXPos.includes("+")) { copyXPos = player().x + parseInt(copyXPos.substring(1)); }
		else if (copyXPos.includes("-")) { copyXPos = player().x - parseInt(copyXPos.substring(1)); }
	}
	if (copyXPos < 0 || copyXPos > 15) {
		console.log("CAN'T COPY. X POSITION ("+copyXPos+") OUT OF BOUNDS. 0-15 EXPECTED.");
		return;
	}

	if (copyYPos == undefined) {
		copyYPos = player().y;
	}
	else {
		copyYPos = copyYPos.toString().trim();
		if (copyYPos == "" ) { copyYPos = player().y; }
		else if (copyYPos.includes("+")) { copyYPos = player().y + parseInt(copyYPos.substring(1)); }
		else if (copyYPos.includes("-")) { copyYPos = player().y - parseInt(copyYPos.substring(1)); }
	}
	if (copyYPos < 0 || copyYPos > 15) {
		console.log("CAN'T COPY. Y POSITION ("+copyYPos+") OUT OF BOUNDS. 0-15 EXPECTED.");
		return;
	}
	
	if (copyRoomId == undefined) {
		copyRoomId = curRoom;
	}
	else {
		copyRoomId = copyRoomId.trim();
		if (copyRoomId == "" ) { copyRoomId = curRoom; }
		else if (room[copyRoomId] == undefined) {
			console.log("CAN'T COPY. ROOM ID ("+copyRoomId+") NOT FOUND.");
			return;
		}
	}

	// Trim and sanitize Paste Position parameters, and set relative positions, even if omitted.
	if (pasteXPos == undefined) {
		pasteXPos = player().x;
	}
	else {
		pasteXPos = pasteXPos.toString().trim();
		if (pasteXPos == "" ) { pasteXPos = player().x; }
		else if (pasteXPos.includes("+")) { pasteXPos = player().x + parseInt(pasteXPos.substring(1)); }
		else if (pasteXPos.includes("-")) { pasteXPos = player().x - parseInt(pasteXPos.substring(1)); }
	}
	if (pasteXPos < 0 || pasteXPos > 15) {
		console.log("CAN'T PASTE. X POSITION ("+pasteXPos+") OUT OF BOUNDS. 0-15 EXPECTED.");
		return;
	}

	if (pasteYPos == undefined) {
		pasteYPos = player().y;
	}
	else {
		pasteYPos = pasteYPos.toString().trim();
		if (pasteYPos == "" ) { pasteYPos = player().y; }
		else if (pasteYPos.includes("+")) { pasteYPos = player().y + parseInt(pasteYPos.substring(1)); }
		else if (pasteYPos.includes("-")) { pasteYPos = player().y - parseInt(pasteYPos.substring(1)); }
	}
	if (pasteYPos < 0 || pasteYPos > 15) {
		console.log("CAN'T PASTE. Y POSITION ("+pasteYPos+") OUT OF BOUNDS. 0-15 EXPECTED.");
		return;
	}
	
	if (pasteRoomId == undefined) {
		pasteRoomId = curRoom;
	}
	else {
		pasteRoomId = pasteRoomId.toString().trim();
		if (pasteRoomId == "" ) { pasteRoomId = curRoom; }
		else if (room[pasteRoomId] == undefined) {
			console.log("CAN'T PASTE. ROOM ID ("+pasteRoomId+") NOT FOUND.");
			return;
		}
	}

	//console.log ("COPYING "+mapId+" "+targetId+" at "+copyXPos+","+copyYPos+"(Room "+copyRoomId+")");
	//console.log ("PASTING AT "+pasteXPos+","+pasteYPos+"(Room "+pasteRoomId+")");
	
	// If TIL or undefined.
	if (mapId.toUpperCase() != "ITM" && mapId.toUpperCase() != "SPR") {
		if (targetId == "ANY" || room[copyRoomId].tilemap[copyYPos][copyXPos] == targetId) {
			var copyId = room[copyRoomId].tilemap[copyYPos][copyXPos];
			drawAt("TIL", copyId, pasteXPos, pasteYPos, pasteRoomId);
		}
	}
	
	// If ITM or undefined.
	if (mapId.toUpperCase() != "TIL" && mapId.toUpperCase() != "SPR") {
		// Iterate backwards through items, to prevent issues with removed indexes
		for (var i = room[copyRoomId].items.length-1; i >= 0; i--) {
			var targetItem = room[copyRoomId].items[i];
			if (targetId == "ANY" || targetId == targetItem.id) {
				if (targetItem.x == copyXPos && targetItem.y == copyYPos) {
					drawAt("ITM", targetItem.id, pasteXPos, pasteYPos, pasteRoomId);
				}
			}
		}
	}
	
	// If SPR or undefined.
	if (mapId.toUpperCase() != "TIL" && mapId.toUpperCase() != "ITM") {
		if (targetId == "ANY") {
			for (i in sprite) {
				if (sprite[i].id == "A") {
					console.log("CAN'T TARGET AVATAR. SKIPPING.");
				}
				else if (sprite[i].room == copyRoomId && sprite[i].x == copyXPos && sprite[i].y == copyYPos) {
					var copyId = sprite[i].id;
					drawAt("SPR", copyId, pasteXPos, pasteYPos, pasteRoomId);
				}
			}
		}
		else if (sprite[targetId] != undefined) {
			if (sprite[targetId] != "A" && sprite[targetId].room == copyRoomId && sprite[targetId].x == copyXPos && sprite[targetId].y == copyYPos) {
				var copyId = sprite[targetId].id;
				drawAt("SPR", copyId, pasteXPos, pasteYPos, pasteRoomId);
			}
		}
	}
}

function copyBoxAt (mapId, targetId, x1, y1, x2, y2, copyRoomId, pasteXPos, pasteYPos, pasteRoomId) {
	// Trim and sanitize X and Y Positions, and set relative positions if omitted.
	if (x1 == undefined) {
		x1 = player().x;
	}
	else {
		x1 = x1.toString().trim();
		if (x1 == "" ) { x1 = player().x; }
		else if (x1.includes("+")) { x1 = player().x + parseInt(x1.substring(1)); }
		else if (x1.includes("-")) { x1 = player().x - parseInt(x1.substring(1)); }
	}
	if (x1 < 0 || x1 > 15) {
		console.log("CLAMPING X1 POSITION. XPOS ("+x1+") OUT OF BOUNDS. 0-15 EXPECTED.");
		x1 = Math.max(0, Math.min(x1, 15));
	}
	// X2
	if (x2 == undefined) {
		x2 = player().x;
	}
	else {
		x2 = x2.toString().trim();
		if (x2 == "" ) { x2 = player().x; }
		else if (x2.includes("+")) { x2 = player().x + parseInt(x2.substring(1)); }
		else if (x2.includes("-")) { x2 = player().x - parseInt(x2.substring(1)); }
	}
	if (x2 < 0 || x2 > 15) {
		console.log("CLAMPING X2 POSITION. xPos ("+x2+") OUT OF BOUNDS. 0-15 EXPECTED.");
		x2 = Math.max(0, Math.min(x2, 15));
	}
	// Y1
	if (y1 == undefined) {
		y1 = player().y;
	}
	else {
		y1 = y1.toString().trim();
		if (y1 == "" ) { y1 = player().y; }
		else if (y1.includes("+")) { y1 = player().y + parseInt(y1.substring(1)); }
		else if (y1.includes("-")) { y1 = player().y - parseInt(y1.substring(1)); }
	}
	if (y1 < 0 || y1 > 15) {
		console.log("CLAMPING Y1 POSITION. XPOS ("+y1+") OUT OF BOUNDS. 0-15 EXPECTED.");
		y1 = Math.max(0, Math.min(y1, 15));
	}
	// Y2
	if (y2 == undefined) {
		y2 = player().y;
	}
	else {
		y2 = y2.toString().trim();
		if (y2 == "" ) { y2 = player().y; }
		else if (y2.includes("+")) { y2 = player().y + parseInt(y2.substring(1)); }
		else if (y2.includes("-")) { y2 = player().y - parseInt(y2.substring(1)); }
	}
	if (y2 < 0 || y2 > 15) {
		console.log("CLAMPING Y2 POSITION. xPos ("+y2+") OUT OF BOUNDS. 0-15 EXPECTED.");
		y2 = Math.max(0, Math.min(y2, 15));
	}

	// Trim and sanitize Target Map ID / Type parameter, and use any if not provided.
	if (mapId == undefined) {
		//console.log("TARGET TYPE IS UNDEFINED. DEFAULTING TO ANY (TIL, ITM, OR SPR).");
		mapId = "ANY";
	}
	else {
		mapId = mapId.toString().trim();
		if (mapId == "" || !(mapId.toUpperCase() == "ANY" || mapId.toUpperCase() == "TIL" || mapId.toUpperCase() == "ITM" || mapId.toUpperCase() == "SPR")) {
			//console.log("UNEXPECTED TARGET TYPE ("+mapId+"). DEFAULTING TO ANY (TIL, ITM, OR SPR).");
			mapId = "ANY";
		}
	}

	// Trim and sanitize Target ID parameter, and use any if not provided
	if (targetId == undefined) {
		//console.log("TARGET ID UNDEFINED. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
		targetId = "ANY";
	}
	else {
		targetId = targetId.toString().trim();
		if (targetId == "") {
			//console.log("NO TARGET ID GIVEN. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
			targetId = "ANY";
		}
	}

	if (copyRoomId == undefined) {
		copyRoomId = curRoom;
	}
	else {
		copyRoomId = copyRoomId.toString().trim();
		if (copyRoomId == "" ) { copyRoomId = curRoom; }
		else if (room[copyRoomId] == undefined) {
			console.log("CAN'T COPY. ROOM ID ("+copyRoomId+") NOT FOUND.");
			return;
		}
	}

	// Trim and sanitize Paste Position parameters, and set relative positions, even if omitted.
	if (pasteXPos == undefined) {
		pasteXPos = player().x;
	}
	else {
		pasteXPos = pasteXPos.toString().trim();
		if (pasteXPos == "" ) { pasteXPos = player().x; }
		else if (pasteXPos.includes("+")) { pasteXPos = player().x + parseInt(pasteXPos.substring(1)); }
		else if (pasteXPos.includes("-")) { pasteXPos = player().x - parseInt(pasteXPos.substring(1)); }
	}
	if (pasteXPos < 0 || pasteXPos > 15) {
		console.log("CAN'T PASTE. X POSITION ("+pasteXPos+") OUT OF BOUNDS. 0-15 EXPECTED.");
		return;
	}
	else {
		pasteXPos = parseInt(pasteXPos);
	}

	if (pasteYPos == undefined) {
		pasteYPos = player().y;
	}
	else {
		pasteYPos = pasteYPos.toString().trim();
		if (pasteYPos == "" ) { pasteYPos = player().y; }
		else if (pasteYPos.includes("+")) { pasteYPos = player().y + parseInt(pasteYPos.substring(1)); }
		else if (pasteYPos.includes("-")) { pasteYPos = player().y - parseInt(pasteYPos.substring(1)); }
	}
	if (pasteYPos < 0 || pasteYPos > 15) {
		console.log("CAN'T PASTE. Y POSITION ("+pasteYPos+") OUT OF BOUNDS. 0-15 EXPECTED.");
		return;
	}
	else {
		pasteYPos = parseInt(pasteYPos);
	}
	
	if (pasteRoomId == undefined) {
		pasteRoomId = curRoom;
	}
	else {
		pasteRoomId = pasteRoomId.toString().trim();
		if (pasteRoomId == "" ) { pasteRoomId = curRoom; }
		else if (room[pasteRoomId] == undefined) {
			console.log("CAN'T PASTE. ROOM ID ("+pasteRoomId+") NOT FOUND.");
			return;
		}
	}

	// Calculate which coordinates are the actual top left and bottom right.
	var topPos = Math.min(y1, y2);
	var leftPos = Math.min(x1, x2);
	var bottomPos = Math.max(y1, y2);
	var rightPos = Math.max(x1, x2);
	var copyIds = [];
	var copyMaps = [];
	var copyXs = [];
	var copyYs = [];

	var colId = -1;
	var rowId = -1;

	// Store maps and ids to copy
	for (var xPos = leftPos; xPos <= rightPos; xPos++) {
		colId = -1;
		rowId++;
		for (var yPos = topPos; yPos <= bottomPos; yPos++) {
			colId++;
			// If TIL or undefined.
			if (mapId.toUpperCase() != "ITM" && mapId.toUpperCase() != "SPR") {
				if (targetId == "ANY" || room[copyRoomId].tilemap[yPos][xPos] == targetId) {
					copyIds.push(room[copyRoomId].tilemap[yPos][xPos]);
					copyMaps.push("TIL");
					copyXs.push(pasteXPos+rowId);
					copyYs.push(pasteYPos+colId);
				}
			}
			
			// If ITM or undefined.
			if (mapId.toUpperCase() != "TIL" && mapId.toUpperCase() != "SPR") {
				// Iterate backwards through items, to prevent issues with removed indexes
				for (var i = room[copyRoomId].items.length-1; i >= 0; i--) {
					var targetItem = room[copyRoomId].items[i];
					if (targetId == "ANY" || targetId == targetItem.id) {
						if (targetItem.x == xPos && targetItem.y == yPos) {
							copyIds.push(targetItem.id);
							copyMaps.push("ITM");
							copyXs.push(pasteXPos+xPos-1);
							copyYs.push(pasteYPos+yPos-1);
						}
					}
				}
			}
			
			// If SPR or undefined.
			if (mapId.toUpperCase() != "TIL" && mapId.toUpperCase() != "ITM") {
				if (targetId == "ANY") {
					for (i in sprite) {
						if (sprite[i].id == "A") {
							console.log("CAN'T TARGET AVATAR. SKIPPING.");
						}
						else if (sprite[i].room == copyRoomId && sprite[i].x == xPos && sprite[i].y == yPos) {
							copyIds.push(sprite[i].id);
							copyMaps.push("SPR");
							copyXs.push(pasteXPos+xPos-1);
							copyYs.push(pasteYPos+yPos-1);
						}
					}
				}
				else if (sprite[targetId] != undefined) {
					if (sprite[targetId] != "A" && sprite[targetId].room == copyRoomId && sprite[targetId].x == xPos && sprite[targetId].y == yPos) {
						copyIds.push(sprite[i].id);
						copyMaps.push("SPR");
						copyXs.push(pasteXPos+xPos-1);
						copyYs.push(pasteYPos+yPos-1);
					}
				}
			}
		}
	}

	// Paste in from copied arrays, at paste position.
	for (var i = 0; i <= copyIds.length; i++) {
		drawAt(copyMaps[i], copyIds[i], copyXs[i], copyYs[i], pasteRoomId);
	}
}

}(window));

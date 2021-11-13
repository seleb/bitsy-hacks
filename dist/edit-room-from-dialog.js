/**
🏠
@file edit room from dialog
@summary modify the content of a room from dialog
@license MIT
@author Dana Holdampf
@version 19.2.0
@requires Bitsy 7.10


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
				Anything (ANY): Targeting anything will target all valid Tiles, Items, and Sprites.
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
					Anything (ANY): Targeting anything will copy all valid Tiles, Items, and Sprites.
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
* */
(function (bitsy) {
'use strict';

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

bitsy = bitsy || /*#__PURE__*/_interopDefaultLegacy(bitsy);

/**
 * Helper used to replace code in a script tag based on a search regex.
 * To inject code without erasing original string, using capturing groups; e.g.
 * ```js
 * inject(/(some string)/,'injected before $1 injected after');
 * ```
 * @param searcher Regex to search and replace
 * @param replacer Replacer string/fn
 */
function inject$1(searcher, replacer) {
    // find the relevant script tag
    var scriptTags = document.getElementsByTagName('script');
    var scriptTag;
    var code = '';
    for (var i = 0; i < scriptTags.length; ++i) {
        scriptTag = scriptTags[i];
        if (!scriptTag.textContent)
            continue;
        var matchesSearch = scriptTag.textContent.search(searcher) !== -1;
        var isCurrentScript = scriptTag === document.currentScript;
        if (matchesSearch && !isCurrentScript) {
            code = scriptTag.textContent;
            break;
        }
    }
    // error-handling
    if (!code || !scriptTag) {
        throw new Error('Couldn\'t find "' + searcher + '" in script tags');
    }
    // modify the content
    code = code.replace(searcher, replacer);
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
// Ex: inject(/(names.sprite.set\( name, id \);)/, '$1console.dir(names)');
/** test */
function kitsyInject(searcher, replacer) {
    if (!kitsy.queuedInjectScripts.some(function (script) {
        return searcher.toString() === script.searcher.toString() && replacer === script.replacer;
    })) {
        kitsy.queuedInjectScripts.push({
            searcher: searcher,
            replacer: replacer,
        });
    }
    else {
        console.warn('Ignored duplicate inject');
    }
}
// Ex: before('load_game', function run() { alert('Loading!'); });
//     before('show_text', function run(text) { return text.toUpperCase(); });
//     before('show_text', function run(text, done) { done(text.toUpperCase()); });
function before$1(targetFuncName, beforeFn) {
    kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
    kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
}
// Ex: after('load_game', function run() { alert('Loaded!'); });
function after$1(targetFuncName, afterFn) {
    kitsy.queuedAfterScripts[targetFuncName] = kitsy.queuedAfterScripts[targetFuncName] || [];
    kitsy.queuedAfterScripts[targetFuncName].push(afterFn);
}
function applyInjects() {
    kitsy.queuedInjectScripts.forEach(function (injectScript) {
        inject$1(injectScript.searcher, injectScript.replacer);
    });
}
function applyHooks(root) {
    var allHooks = unique(Object.keys(kitsy.queuedBeforeScripts).concat(Object.keys(kitsy.queuedAfterScripts)));
    allHooks.forEach(applyHook.bind(this, root || window));
}
function applyHook(root, functionName) {
    var functionNameSegments = functionName.split('.');
    var obj = root;
    while (functionNameSegments.length > 1) {
        obj = obj[functionNameSegments.shift()];
    }
    var lastSegment = functionNameSegments[0];
    var superFn = obj[lastSegment];
    var superFnLength = superFn ? superFn.length : 0;
    var functions = [];
    // start with befores
    functions = functions.concat(kitsy.queuedBeforeScripts[functionName] || []);
    // then original
    if (superFn) {
        functions.push(superFn);
    }
    // then afters
    functions = functions.concat(kitsy.queuedAfterScripts[functionName] || []);
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
            }
            // run synchronously
            returnVal = functions[i++].apply(this, args);
            if (returnVal && returnVal.length) {
                args = returnVal;
            }
            return runBefore.apply(this, args);
        }
        return runBefore.apply(this, arguments);
    };
}
/**
@file kitsy-script-toolkit
@summary Monkey-patching toolkit to make it easier and cleaner to run code before and after functions or to inject new code into script tags
@license WTFPL (do WTF you want)
@author Original by mildmojo; modified by Sean S. LeBlanc
@version 19.2.0
@requires Bitsy 7.10

*/
var kitsy = (window.kitsy = window.kitsy || {
    queuedInjectScripts: [],
    queuedBeforeScripts: {},
    queuedAfterScripts: {},
    inject: kitsyInject,
    before: before$1,
    after: after$1,
    /**
     * Applies all queued `inject` calls.
     *
     * An object that instantiates an class modified via injection will still refer to the original class,
     * so make sure to reinitialize globals that refer to injected scripts before calling `applyHooks`.
     */
    applyInjects,
    /** Apples all queued `before`/`after` calls. */
    applyHooks,
});

var hooked = kitsy.hooked;
if (!hooked) {
	kitsy.hooked = true;
	var oldStartFunc = bitsy.startExportedGame;
	bitsy.startExportedGame = function doAllInjections() {
		// Only do this once.
		bitsy.startExportedGame = oldStartFunc;

		// Rewrite scripts
		kitsy.applyInjects();

		// recreate the script and dialog objects so that they'll be
		// referencing the code with injections instead of the original
		bitsy.scriptModule = new bitsy.Script();
		bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();

		bitsy.dialogModule = new bitsy.Dialog();
		bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
		bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();
		bitsy.renderer = new bitsy.TileRenderer(bitsy.tilesize);

		// Hook everything
		kitsy.applyHooks();

		// reset callbacks using hacked functions
		bitsy.bitsyOnUpdate(bitsy.update);
		bitsy.bitsyOnQuit(bitsy.stopGame);
		bitsy.bitsyOnLoad(bitsy.load_game);

		// Start the game
		bitsy.startExportedGame.apply(this, arguments);
	};
}

/** @see kitsy.inject */
var inject = kitsy.inject;
/** @see kitsy.before */
var before = kitsy.before;
/** @see kitsy.after */
var after = kitsy.after;

// Rewrite custom functions' parentheses to curly braces for Bitsy's
// interpreter. Unescape escaped parentheticals, too.
function convertDialogTags(input, tag) {
	return input.replace(new RegExp('\\\\?\\((' + tag + '(\\s+(".*?"|.+?))?)\\\\?\\)', 'g'), function (match, group) {
		if (match.substr(0, 1) === '\\') {
			return '(' + group + ')'; // Rewrite \(tag "..."|...\) to (tag "..."|...)
		}
		return '{' + group + '}'; // Rewrite (tag "..."|...) to {tag "..."|...}
	});
}

function addDialogFunction(tag, fn) {
	kitsy.dialogFunctions = kitsy.dialogFunctions || {};
	if (kitsy.dialogFunctions[tag]) {
		console.warn('The dialog function "' + tag + '" already exists.');
		return;
	}

	// Hook into game load and rewrite custom functions in game data to Bitsy format.
	before('parseWorld', function (gameData) {
		return [convertDialogTags(gameData, tag)];
	});

	kitsy.dialogFunctions[tag] = fn;
}

function injectDialogTag(tag, code) {
	inject(/(var functionMap = \{\};[^]*?)(this.HasFunction)/m, '$1\nfunctionMap["' + tag + '"] = ' + code + ';\n$2');
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
	var deferred = (bitsy.kitsy.deferredDialogFunctions[tag] = []);
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

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
@version 19.2.0
@requires Bitsy 7.10

*/

/**
 * Helper for parsing parameters that may be relative to another value
 * e.g.
 * - getRelativeNumber('1', 5) -> 1
 * - getRelativeNumber('+1', 5) -> 6
 * - getRelativeNumber('-1', 5) -> 4
 * - getRelativeNumber('', 5) -> 5
 * @param {string} value absolute or relative string to parse
 * @param {number} relativeTo value to use as fallback if none is provided, and as base for relative value
 * @return {number} resulting absolute or relative number
 */
function getRelativeNumber(value, relativeTo) {
	var v = value || value === 0 ? value : relativeTo;
	if (typeof v === 'string' && (v.startsWith('+') || v.startsWith('-'))) {
		return relativeTo + Number(v);
	}
	return Number(v);
}

/**
 * @param {number} value number to clamp
 * @param {number} min minimum
 * @param {number} max maximum
 * @return min if value < min, max if value > max, value otherwise
 */
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}



// Draws an Item, Sprite, or Tile at a location in a room
// {draw "mapId, sourceId, xPos, yPos, roomID"}
// {drawNow "mapId, sourceId, xPos, yPos, roomID"}
addDualDialogTag('draw', function (environment, parameters) {
	var params = parameters[0].split(',');
	drawAt(params[0], params[1], params[2], params[3], params[4]);
});

// As above, but affects a box area, between two corners.
// {drawBox "mapId, sourceId, x1, y1, x2, y2, roomID"}
// {drawBoxNow "mapId, sourceId, x1, y1, x2, y2, roomID"}
addDualDialogTag('drawBox', function (environment, parameters) {
	var params = parameters[0].split(',');
	drawBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
});

// As above, but affects an entire room.
// {drawAll "mapId, sourceId, roomID"}
// {drawAllNow "mapId, sourceId, roomID"}
addDualDialogTag('drawAll', function (environment, parameters) {
	var params = parameters[0].split(',');
	drawBoxAt(params[0], params[1], 0, 0, bitsy.mapsize - 1, bitsy.mapsize - 1, params[2]);
});

// Removes Items, Sprites, and/or Tiles at a location in a room
// {erase "mapId, targetId, xPos, yPos, roomID"}
// {eraseNow "mapId, targetId, xPos, yPos, roomID"}
addDualDialogTag('erase', function (environment, parameters) {
	var params = parameters[0].split(',');
	eraseAt(params[0], params[1], params[2], params[3], params[4]);
});

// As above, but affects a box area, between two corners.
// {eraseBox "mapId, targetId, x1, y1, x2, y2, roomID"}
// {eraseBoxNow "mapId, targetId, x1, y1, x2, y2, roomID"}
addDualDialogTag('eraseBox', function (environment, parameters) {
	var params = parameters[0].split(',');
	eraseBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
});

// As above, but affects an entire room.
// {eraseAll "mapId, targetId, roomID"}
// {eraseAllNow "mapId, targetId, roomID"}
addDualDialogTag('eraseAll', function (environment, parameters) {
	var params = parameters[0].split(',');
	eraseBoxAt(params[0], params[1], 0, 0, bitsy.mapsize - 1, bitsy.mapsize - 1, params[2]);
});

// Converts instances of target Item, Sprite, or Tile at a location in a room into something new
// {replace "targetMapId, targetId, newMapId, newId, xPos, yPos, roomID"}
// {replaceNow "targetMapId, targetId, newMapId, newId, xPos, yPos, roomID"}
addDualDialogTag('replace', function (environment, parameters) {
	var params = parameters[0].split(',');
	replaceAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
});

// As above, but affects a box area between two corners.
// {replaceBox "targetMapId, targetId, newMapId, newId, x1, y1, x2, y2, roomID"}
// {replaceBoxNow "targetMapId, targetId, newMapId, newId, x1, y1, x2, y2, roomID"}
addDualDialogTag('replaceBox', function (environment, parameters) {
	var params = parameters[0].split(',');
	replaceBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8]);
});

// As above, but affects an entire room.
// {replaceAll "targetMapId, targetId, newMapId, roomID"}
// {replaceAllNow "targetMapId, targetId, newMapId, newId, roomID"}
addDualDialogTag('replaceAll', function (environment, parameters) {
	var params = parameters[0].split(',');
	replaceBoxAt(params[0], params[1], params[2], params[3], 0, 0, bitsy.mapsize - 1, bitsy.mapsize - 1, params[4]);
});

// Duplicates Items, Sprites, and/or Tiles from one location in a room to another
// {copy "mapId, targetId, copyX, copyY, copyRoom, pasteX, pasteY, pasteRoom"}
// {copyNow "mapId, targetId, copyX, copyY, copyRoom, pasteX, pasteY, pasteRoom"}
addDualDialogTag('copy', function (environment, parameters) {
	var params = parameters[0].split(',');
	copyAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7]);
});

// As above, but copies a box area between two corners, and pastes at a new spot designating the upper-left corner
// NOTE: positioning the paste coordinates out of bounds will only draw the section overlapping with the room.
// {copyBox "mapId, targetId, copyX1, copyY1, copyX2, copyY2, copyRoom, pasteX, pasteY, pasteRoom"}
// {copyBoxNow "mapId, targetId, copyX1, copyY1, copyX2, copyY2, copyRoom, pasteX, pasteY, pasteRoom"}
addDualDialogTag('copyBox', function (environment, parameters) {
	var params = parameters[0].split(',');
	copyBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], params[9]);
});

// As above, but affects an entire room.
// {copyAll "mapId, targetId, copyRoom, pasteRoom"}
// {copyAllNow "mapId, targetId, copyRoom, pasteRoom"}
addDualDialogTag('copyAll', function (environment, parameters) {
	var params = parameters[0].split(',');
	copyBoxAt(params[0], params[1], 0, 0, bitsy.mapsize - 1, bitsy.mapsize - 1, params[3], 0, 0, params[4]);
});

function drawAt(mapId, sourceId, xPos, yPos, roomId) {
	// Trim and sanitize Map ID / Type parameter, and return if not provided.
	mapId = (mapId || '').toString().trim().toUpperCase();
	if (!['TIL', 'ITM', 'SPR'].includes(mapId)) {
		console.log("CAN'T DRAW. UNEXPECTED DRAW TYPE (" + mapId + '). TIL, ITM, OR SPR EXPECTED.');
		return;
	}

	// Trim and sanitize Source ID parameter, and return if not provided
	sourceId = (sourceId || '').toString().trim();
	if (!sourceId) {
		console.log("CAN'T DRAW. NO SOURCE ID GIVEN. TILE, ITEM, OR SPRITE ID EXPECTED.");
		return;
	}

	// Trim and sanitize X Position parameter, and set relative positions, even if omitted.
	xPos = getRelativeNumber(xPos, bitsy.player().x);
	if (xPos < 0 || xPos > bitsy.mapsize - 1) {
		console.log("CAN'T DRAW. X POSITION (" + xPos + ') OUT OF BOUNDS. 0-' + bitsy.mapsize - 1 + ' EXPECTED.');
		return;
	}

	// Trim and sanitize Y Position parameter, and set relative positions, even if omitted
	yPos = getRelativeNumber(yPos, bitsy.player().y);
	if (yPos < 0 || yPos > bitsy.mapsize - 1) {
		console.log("CAN'T DRAW. Y POSITION (" + yPos + ') OUT OF BOUNDS. 0-' + bitsy.mapsize - 1 + ' EXPECTED.');
		return;
	}

	// Trim and sanitize Room ID parameter, and set to current room if omitted
	roomId = (roomId || bitsy.curRoom).toString().trim();
	if (!bitsy.room[roomId]) {
		console.log("CAN'T DRAW. ROOM ID (" + roomId + ') NOT FOUND.');
		return;
	}

	switch (mapId) {
		case 'TIL':
			if (bitsy.tile[sourceId]) {
				bitsy.room[roomId].tilemap[yPos][xPos] = sourceId;
			}
			break;
		case 'ITM':
			if (bitsy.item[sourceId]) {
				var newItem = {
					id: sourceId,
					x: xPos,
					y: yPos,
				};
				bitsy.room[roomId].items.push(newItem);
			}
			break;
		case 'SPR':
			if (bitsy.sprite[sourceId]) {
				if (bitsy.sprite[sourceId].id === bitsy.playerId) {
					console.log("CAN'T TARGET AVATAR. SKIPPING.");
				} else if (bitsy.room[roomId]) {
					bitsy.sprite[sourceId].room = roomId;
					bitsy.sprite[sourceId].x = xPos;
					bitsy.sprite[sourceId].y = yPos;
				}
			}
			break;
	}
}

function drawBoxAt(mapId, sourceId, x1, y1, x2, y2, roomId) {
	// Trim and sanitize X and Y Positions, and set relative positions if omitted.
	x1 = clamp(getRelativeNumber(x1, bitsy.player().x), 0, bitsy.mapsize - 1);
	x2 = clamp(getRelativeNumber(x2, bitsy.player().x), 0, bitsy.mapsize - 1);
	y1 = clamp(getRelativeNumber(y1, bitsy.player().y), 0, bitsy.mapsize - 1);
	y2 = clamp(getRelativeNumber(y2, bitsy.player().y), 0, bitsy.mapsize - 1);

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

function eraseAt(mapId, targetId, xPos, yPos, roomId) {
	mapId = (mapId || 'ANY').toString().trim().toUpperCase();
	targetId = (targetId || 'ANY').toString().trim();

	// Trim and sanitize X Position parameter, and set relative positions, even if omitted.
	xPos = getRelativeNumber(xPos, bitsy.player().x);
	if (xPos < 0 || xPos > bitsy.mapsize - 1) {
		console.log("CAN'T DRAW. X POSITION (" + xPos + ') OUT OF BOUNDS. 0-' + bitsy.mapsize - 1 + ' EXPECTED.');
		return;
	}

	// Trim and sanitize Y Position parameter, and set relative positions, even if omitted
	yPos = getRelativeNumber(yPos, bitsy.player().y);
	if (yPos < 0 || yPos > bitsy.mapsize - 1) {
		console.log("CAN'T DRAW. Y POSITION (" + yPos + ') OUT OF BOUNDS. 0-' + bitsy.mapsize - 1 + ' EXPECTED.');
		return;
	}

	// Trim and sanitize Room ID parameter, and set to current room if omitted
	roomId = (roomId || bitsy.curRoom).toString().trim();
	if (!bitsy.room[roomId]) {
		console.log("CAN'T DRAW. ROOM ID (" + roomId + ') NOT FOUND.');
		return;
	}

	// tiles
	if ((mapId === 'TIL' || mapId === 'ANY') && (targetId.toUpperCase() === 'ANY' || bitsy.room[roomId].tilemap[yPos][xPos] === targetId)) {
		bitsy.room[roomId].tilemap[yPos][xPos] = '0';
	}

	// items
	if (mapId === 'ITM' || mapId === 'ANY') {
		// Iterate backwards through items, to prevent issues with removed indexes
		bitsy.room[roomId].items = bitsy.room[roomId].items.filter(function (item) {
			return !((targetId.toUpperCase() === 'ANY' || item.id === targetId) && item.x === xPos && item.y === yPos);
		});
	}

	// sprites
	if (mapId === 'SPR' || mapId === 'ANY') {
		if (targetId.toUpperCase() === 'ANY') {
			Object.values(bitsy.sprite).forEach(function (spr) {
				if (spr.id === bitsy.playerId) {
					console.log("CAN'T TARGET AVATAR. SKIPPING.");
				} else if (spr.room === roomId && spr.x === xPos && spr.y === yPos) {
					spr.x = 0;
					spr.y = 0;
					spr.room = 'default';
				}
			});
		} else if (bitsy.sprite[targetId]) {
			if (bitsy.sprite[targetId].id === bitsy.playerId) {
				console.log("CAN'T TARGET AVATAR. SKIPPING.");
			} else if (bitsy.sprite[targetId].room === roomId && bitsy.sprite[targetId].x === xPos && bitsy.sprite[targetId].y === yPos) {
				bitsy.sprite[targetId].x = 0;
				bitsy.sprite[targetId].y = 0;
				bitsy.sprite[targetId].room = 'default';
			}
		}
	}
}

function eraseBoxAt(mapId, targetId, x1, y1, x2, y2, roomId) {
	// Trim and sanitize X and Y Positions, and set relative positions if omitted.
	x1 = clamp(getRelativeNumber(x1, bitsy.player().x), 0, bitsy.mapsize - 1);
	x2 = clamp(getRelativeNumber(x2, bitsy.player().x), 0, bitsy.mapsize - 1);
	y1 = clamp(getRelativeNumber(y1, bitsy.player().y), 0, bitsy.mapsize - 1);
	y2 = clamp(getRelativeNumber(y2, bitsy.player().y), 0, bitsy.mapsize - 1);

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

function replaceAt(targetMapId, targetId, newMapId, newId, xPos, yPos, roomId) {
	// Trim and sanitize Target Map ID / Type parameter, and use any if not provided.
	targetMapId = (targetMapId || 'ANY').toString().trim().toUpperCase();
	// Trim and sanitize Target ID parameter, and use any if not provided
	targetId = (targetId || 'ANY').toString().trim();

	// Trim and sanitize New Map ID / Type parameter, and return if not provided.
	newMapId = (newMapId || '').toString().trim().toUpperCase();
	if (!['TIL', 'ITM', 'SPR'].includes(newMapId)) {
		console.log('CANNOT REPLACE. UNEXPECTED REPLACING TYPE (' + newMapId + '). TIL, ITM, OR SPR EXPECTED.');
		return;
	}

	// Trim and sanitize New Target ID parameter, and return if not provided
	newId = (newId || '').toString().trim();
	if (!newId) {
		console.log('CANNOT REPLACE. NEW TARGET ID UNDEFINED. VALID ID EXPECTED).');
		return;
	}

	// Trim and sanitize X Position parameter, and set relative positions, even if omitted.
	xPos = getRelativeNumber(xPos, bitsy.player().x);
	if (xPos < 0 || xPos > bitsy.mapsize - 1) {
		console.log("CAN'T REPLACE. X POSITION (" + xPos + ') OUT OF BOUNDS. 0-' + bitsy.mapsize - 1 + ' EXPECTED.');
		return;
	}

	// Trim and sanitize Y Position parameter, and set relative positions, even if omitted
	yPos = getRelativeNumber(yPos, bitsy.player().y);
	if (yPos < 0 || yPos > bitsy.mapsize - 1) {
		console.log("CAN'T REPLACE. Y POSITION (" + yPos + ') OUT OF BOUNDS. 0-' + bitsy.mapsize - 1 + ' EXPECTED.');
		return;
	}

	// Trim and sanitize Room ID parameter, and set to current room if omitted
	roomId = (roomId || bitsy.curRoom).toString().trim();
	if (!bitsy.room[roomId]) {
		console.log("CAN'T REPLACE. ROOM ID (" + roomId + ') NOT FOUND.');
		return;
	}

	// tiles
	if (targetMapId === 'TIL' || targetMapId === 'ANY') {
		if (targetId === 'ANY' || bitsy.room[roomId].tilemap[yPos][xPos] === targetId) {
			bitsy.room[roomId].tilemap[yPos][xPos] = '0';
			drawAt(newMapId, newId, xPos, yPos, roomId);
		}
	}

	// items
	if (targetMapId === 'ITM' || targetMapId === 'ANY') {
		// Iterate backwards through items, to prevent issues with removed indexes
		for (var i = bitsy.room[roomId].items.length - 1; i >= 0; i--) {
			var item = bitsy.room[roomId].items[i];
			if (targetId === 'ANY' || targetId === item.id) {
				if (item.x === xPos && item.y === yPos) {
					bitsy.room[roomId].items.splice(i, 1);
					drawAt(newMapId, newId, xPos, yPos, roomId);
				}
			}
		}
	}

	// sprites
	if (targetMapId === 'SPR' || targetMapId === 'ANY') {
		if (targetId === 'ANY') {
			Object.values(bitsy.sprite).forEach(function (spr) {
				if (spr.id === bitsy.playerId) {
					console.log("CAN'T TARGET AVATAR. SKIPPING.");
				} else if (spr.room === roomId && spr.x === xPos && spr.y === yPos) {
					spr.x = 0;
					spr.y = 0;
					spr.room = 'default';
					drawAt(newMapId, newId, xPos, yPos, roomId);
				}
			});
		} else if (bitsy.sprite[targetId]) {
			if (bitsy.sprite[targetId] !== bitsy.playerId && bitsy.sprite[targetId].room === roomId && bitsy.sprite[targetId].x === xPos && bitsy.sprite[targetId].y === yPos) {
				bitsy.sprite[targetId].x = 0;
				bitsy.sprite[targetId].y = 0;
				bitsy.sprite[targetId].room = 'default';
				drawAt(newMapId, newId, xPos, yPos, roomId);
			}
		}
	}
}

function replaceBoxAt(targetMapId, targetId, newMapId, newId, x1, y1, x2, y2, roomId) {
	// Trim and sanitize X and Y Positions, and set relative positions if omitted.
	x1 = clamp(getRelativeNumber(x1, bitsy.player().x), 0, bitsy.mapsize - 1);
	x2 = clamp(getRelativeNumber(x2, bitsy.player().x), 0, bitsy.mapsize - 1);
	y1 = clamp(getRelativeNumber(y1, bitsy.player().y), 0, bitsy.mapsize - 1);
	y2 = clamp(getRelativeNumber(y2, bitsy.player().y), 0, bitsy.mapsize - 1);

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

function copyAt(mapId, targetId, copyXPos, copyYPos, copyRoomId, pasteXPos, pasteYPos, pasteRoomId) {
	// Trim and sanitize Target Map ID / Type parameter, and use any if not provided.
	mapId = (mapId || 'ANY').toString().trim().toUpperCase();
	// Trim and sanitize Target ID parameter, and use any if not provided
	targetId = (targetId || 'ANY').toString().trim();

	// Trim and sanitize Copy Position parameters, and set relative positions, even if omitted.
	copyXPos = getRelativeNumber(copyXPos, bitsy.player().x);
	if (copyXPos < 0 || copyXPos > bitsy.mapsize - 1) {
		console.log("CAN'T COPY. X POSITION (" + copyXPos + ') OUT OF BOUNDS. 0-' + bitsy.mapsize - 1 + ' EXPECTED.');
		return;
	}

	copyYPos = getRelativeNumber(copyYPos, bitsy.player().y);
	if (copyYPos < 0 || copyYPos > bitsy.mapsize - 1) {
		console.log("CAN'T COPY. Y POSITION (" + copyYPos + ') OUT OF BOUNDS. 0-' + bitsy.mapsize - 1 + ' EXPECTED.');
		return;
	}

	// Trim and sanitize Target ID parameter, and use any if not provided
	copyRoomId = (copyRoomId || bitsy.curRoom).toString().trim();
	if (!bitsy.room[copyRoomId]) {
		console.log("CAN'T COPY. ROOM ID (" + copyRoomId + ') NOT FOUND.');
		return;
	}

	// Trim and sanitize Paste Position parameters, and set relative positions, even if omitted.
	pasteXPos = getRelativeNumber(pasteXPos, bitsy.player().x);
	if (pasteXPos < 0 || pasteXPos > bitsy.mapsize - 1) {
		console.log("CAN'T PASTE. X POSITION (" + pasteXPos + ') OUT OF BOUNDS. 0-' + bitsy.mapsize - 1 + ' EXPECTED.');
		return;
	}

	pasteYPos = getRelativeNumber(pasteYPos, bitsy.player().y);
	if (pasteYPos < 0 || pasteYPos > bitsy.mapsize - 1) {
		console.log("CAN'T PASTE. Y POSITION (" + pasteYPos + ') OUT OF BOUNDS. 0-' + bitsy.mapsize - 1 + ' EXPECTED.');
		return;
	}

	pasteRoomId = (pasteRoomId || bitsy.curRoom).toString().trim();
	if (!bitsy.room[pasteRoomId]) {
		console.log("CAN'T PASTE. ROOM ID (" + pasteRoomId + ') NOT FOUND.');
		return;
	}

	// tiles
	if (mapId === 'TIL' || mapId === 'ANY') {
		if (targetId === 'ANY' || bitsy.room[copyRoomId].tilemap[copyYPos][copyXPos] === targetId) {
			drawAt('TIL', bitsy.room[copyRoomId].tilemap[copyYPos][copyXPos], pasteXPos, pasteYPos, pasteRoomId);
		}
	}

	// items
	if (mapId === 'ITM' || mapId === 'ANY') {
		// Iterate backwards through items, to prevent issues with removed indexes
		for (var i = bitsy.room[copyRoomId].items.length - 1; i >= 0; i--) {
			var targetItem = bitsy.room[copyRoomId].items[i];
			if (targetId === 'ANY' || targetId === targetItem.id) {
				if (targetItem.x === copyXPos && targetItem.y === copyYPos) {
					drawAt('ITM', targetItem.id, pasteXPos, pasteYPos, pasteRoomId);
				}
			}
		}
	}

	// sprites
	if (mapId === 'SPR' || mapId === 'ANY') {
		if (targetId === 'ANY') {
			Object.values(bitsy.sprite).forEach(function (spr) {
				if (spr.id === bitsy.playerId) {
					console.log("CAN'T TARGET AVATAR. SKIPPING.");
				} else if (spr.room === copyRoomId && spr.x === copyXPos && spr.y === copyYPos) {
					var copyId = spr.id;
					drawAt('SPR', copyId, pasteXPos, pasteYPos, pasteRoomId);
				}
			});
		} else if (bitsy.sprite[targetId]) {
			if (bitsy.sprite[targetId] !== bitsy.playerId && bitsy.sprite[targetId].room === copyRoomId && bitsy.sprite[targetId].x === copyXPos && bitsy.sprite[targetId].y === copyYPos) {
				drawAt('SPR', bitsy.sprite[targetId].id, pasteXPos, pasteYPos, pasteRoomId);
			}
		}
	}
}

function copyBoxAt(mapId, targetId, x1, y1, x2, y2, copyRoomId, pasteXPos, pasteYPos, pasteRoomId) {
	// Trim and sanitize X and Y Positions, and set relative positions if omitted.
	x1 = clamp(getRelativeNumber(x1, bitsy.player().x), 0, bitsy.mapsize - 1);
	x2 = clamp(getRelativeNumber(x2, bitsy.player().x), 0, bitsy.mapsize - 1);
	y1 = clamp(getRelativeNumber(y1, bitsy.player().y), 0, bitsy.mapsize - 1);
	y2 = clamp(getRelativeNumber(y2, bitsy.player().y), 0, bitsy.mapsize - 1);

	// Trim and sanitize Target Map ID / Type parameter, and use any if not provided.
	mapId = (mapId || 'ANY').toString().trim().toUpperCase();

	// Trim and sanitize Target ID parameter, and use any if not provided
	targetId = (targetId || 'ANY').toString().trim();

	copyRoomId = (copyRoomId || bitsy.curRoom).toString().trim();
	if (!bitsy.room[copyRoomId]) {
		console.log("CAN'T COPY. ROOM ID (" + copyRoomId + ') NOT FOUND.');
		return;
	}

	// Trim and sanitize Paste Position parameters, and set relative positions, even if omitted.
	pasteXPos = getRelativeNumber(pasteXPos, bitsy.player().x);
	if (pasteXPos < 0 || pasteXPos > bitsy.mapsize - 1) {
		console.log("CAN'T PASTE. X POSITION (" + pasteXPos + ') OUT OF BOUNDS. 0-' + bitsy.mapsize - 1 + ' EXPECTED.');
		return;
	}

	pasteYPos = getRelativeNumber(pasteYPos, bitsy.player().y);
	if (pasteYPos < 0 || pasteYPos > bitsy.mapsize - 1) {
		console.log("CAN'T PASTE. Y POSITION (" + pasteYPos + ') OUT OF BOUNDS. 0-' + bitsy.mapsize - 1 + ' EXPECTED.');
		return;
	}

	pasteRoomId = (pasteRoomId || bitsy.curRoom).toString().trim();
	if (!bitsy.room[pasteRoomId]) {
		console.log("CAN'T PASTE. ROOM ID (" + pasteRoomId + ') NOT FOUND.');
		return;
	}

	// Calculate which coordinates are the actual top left and bottom right.
	var topPos = Math.min(y1, y2);
	var leftPos = Math.min(x1, x2);
	var bottomPos = Math.max(y1, y2);
	var rightPos = Math.max(x1, x2);
	var copy = [];

	var box = [];
	var x;
	var y;
	for (y = topPos; y <= bottomPos; ++y) {
		for (x = leftPos; x <= rightPos; ++x) {
			box.push({
				x,
				y,
			});
		}
	}

	// Store maps and ids to copy
	box.forEach(function (pos) {
		x = pos.x;
		y = pos.y;
		// tiles
		if (mapId === 'TIL' || mapId === 'ANY') {
			if (targetId === 'ANY' || bitsy.room[copyRoomId].tilemap[y][x] === targetId) {
				copy.push({
					map: 'TIL',
					x: pasteXPos + x - 1,
					y: pasteYPos + y - 1,
					id: bitsy.room[copyRoomId].tilemap[y][x],
				});
			}
		}

		// items
		if (mapId === 'ITM' || mapId === 'ANY') {
			// Iterate backwards through items, to prevent issues with removed indexes
			for (var i = bitsy.room[copyRoomId].items.length - 1; i >= 0; i--) {
				var item = bitsy.room[copyRoomId].items[i];
				if ((targetId === 'ANY' || targetId === item.id) && item.x === x && item.y === y) {
					copy.push({
						map: 'ITM',
						x: pasteXPos + x - 1,
						y: pasteYPos + y - 1,
						id: item.id,
					});
				}
			}
		}

		// sprites
		if (mapId === 'SPR' || mapId === 'ANY') {
			if (targetId === 'ANY') {
				Object.values(bitsy.sprite).forEach(function (spr) {
					if (spr.id === bitsy.playerId) {
						console.log("CAN'T TARGET AVATAR. SKIPPING.");
					} else if (spr.room === copyRoomId && spr.x === x && spr.y === y) {
						copy.push({
							map: 'SPR',
							x: pasteXPos + x - 1,
							y: pasteYPos + y - 1,
							id: spr.id,
						});
					}
				});
			} else if (bitsy.sprite[targetId]) {
				if (bitsy.sprite[targetId] !== bitsy.playerId && bitsy.sprite[targetId].room === copyRoomId && bitsy.sprite[targetId].x === x && bitsy.sprite[targetId].y === y) {
					copy.push({
						map: 'SPR',
						x: pasteXPos + x - 1,
						y: pasteYPos + y - 1,
						id: bitsy.sprite[targetId].id,
					});
				}
			}
		}
	});

	// Paste in from copied arrays, at paste position.
	copy.forEach(function (copyEntry) {
		drawAt(copyEntry.map, copyEntry.id, copyEntry.x, copyEntry.y, pasteRoomId);
	});
}

})(window);

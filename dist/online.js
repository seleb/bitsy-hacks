/**
🔄
@file online
@summary multiplayer bitsy
@license MIT
@author Sean S. LeBlanc
@version 20.2.5
@requires Bitsy 7.12

@description
Provides the groundwork for running a small online multiplayer bitsy game.

Running it requires running a copy of this server: https://github.com/seleb/web-rtc-mesh
Server notes:
	- The actual game data is sent using peer-to-peer data channels;
	the server just hosts client code and negotiates initial connections.
	(i.e. it uses very little bandwidth)
	- A single server can host multiple games simultaneously
	- A sample server is wss://bitsy-online.herokuapp.com
	  This server is free to use, but I recommend setting up your own
	  if you need to guarantee stability or maintenance
	- If you're not sure how to setup/use the server, ask for help!

This hack also includes the hacks for editing images/dialog at runtime through dialog.
This provides the (image), (imageNow), (imagePal), (imagePalNow), and (dialog) commands.
In the online hack, these will automatically trigger a sprite update so that updates to the avatar will be reflected for other players.
See the respective hacks for more info on how to use the commands.

Note on dialog: You can use scripting in the dialog, but it will execute on the other players' games, accessing *their* variables.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit `hackOptions.host` below to point to your server (depending on hosting, you may need to use `ws://` instead of `wss://`)
3. Edit other hackOptions as needed
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	host: 'wss://your signalling server',
	// room: "custom room", // sets the room on the server to use; otherwise, uses game title
	ghosts: false, // if true, sprites from players who disconnected while you were online won't go away until you restart
	debug: false, // if true, includes web-rtc-mesh debug logs in console
};

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
function inject$2(searcher, replacer) {
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
        inject$2(injectScript.searcher, injectScript.replacer);
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
@version 20.2.5
@requires Bitsy 7.12

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
		bitsy.transition = new bitsy.TransitionManager();

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
var inject$1 = kitsy.inject;
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
	inject$1(/(var functionMap = \{\};[^]*?)(this.HasFunction)/m, '$1\nfunctionMap["' + tag + '"] = ' + code + ';\n$2');
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
		var result = fn(environment, parameters);
		onReturn(result === undefined ? null : result);
	});
	addDeferredDialogTag(tag, fn);
}

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
@version 20.2.5
@requires Bitsy 7.12

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

/*
Helper for getting image by name or id

Args:
	name: id or name of image to return
	 map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: the image in the given map with the given name/id
 */
function getImage(name, map) {
	var id = Object.prototype.hasOwnProperty.call(map, name)
		? name
		: Object.keys(map).find(function (e) {
				return map[e].name === name;
		  });
	return map[id];
}

/**
📝
@file edit dialog from dialog
@summary edit dialog from dialog (yes really)
@license MIT
@author Sean S. LeBlanc
@version 20.2.5
@requires Bitsy 7.12


@description
You can use this to edit the dialog of sprites/items through dialog.

(dialog "map, target, newDialog")
Parameters:
	map:       Type of image (SPR or ITM)
	target:    id/name of image to edit
	newDialog: new dialog text

Examples:
(dialog "SPR, a, I am not a cat")

HOW TO USE:
	Copy-paste this script into a new script tag after the Bitsy source code.

TIPS:
	- The player avatar is always a sprite with id "A"; you can edit your gamedata to give them a name for clarity
	- You can use the full names or shorthand of image types (e.g. "SPR" and "sprite" will both work)
*/

// map of maps
var maps$1;
after('load_game', function () {
	maps$1 = {
		spr: bitsy.sprite,
		sprite: bitsy.sprite,
		itm: bitsy.item,
		item: bitsy.item,
	};
});

function editDialog(environment, parameters) {
	// parse parameters
	var params = parameters[0].split(/,\s?/);
	params[0] = (params[0] || '').toLowerCase();
	var mapId = params[0];
	var tgtId = params[1];
	var newDialog = params[2] || '';

	if (!mapId || !tgtId) {
		throw new Error('Image expects three parameters: "map, target, newDialog", but received: "' + params.join(', ') + '"');
	}

	// get objects
	var mapObj = maps$1[mapId];
	if (!mapObj) {
		throw new Error('Invalid map "' + mapId + '". Try "SPR" or "ITM" instead.');
	}
	var tgtObj = getImage(tgtId, mapObj);
	if (!tgtObj) {
		throw new Error('Target "' + tgtId + '" was not the id/name of a ' + mapId + '.');
	}
	bitsy.dialog[tgtObj.dlg].src = newDialog;
	bitsy.scriptInterpreter.Compile(tgtObj.dlg, newDialog);
}

// hook up the dialog tag
addDeferredDialogTag('dialog', editDialog);

/**
@file edit image at runtime
@summary API for updating image data at runtime.
@author Sean S. LeBlanc
@version 20.2.5
@requires Bitsy 7.12

@description
Adds API for updating sprite, tile, and item data at runtime.

Individual frames of image data in bitsy are 8x8 1-bit 2D arrays in yx order
e.g. the default player is:
[
	[0,0,0,1,1,0,0,0],
	[0,0,0,1,1,0,0,0],
	[0,0,0,1,1,0,0,0],
	[0,0,1,1,1,1,0,0],
	[0,1,1,1,1,1,1,0],
	[1,0,1,1,1,1,0,1],
	[0,0,1,0,0,1,0,0],
	[0,0,1,0,0,1,0,0]
]
*/

// force cache to clear if edit image fns are used
inject(
	/\/\/ TODO : reset render cache for this image/,
	`
Object.keys(drawingCache.render)
	.filter(function (i) { return i.split('_').slice(0, -1).join('_') === drawingId; })
	.forEach(function(i) { drawingCache.render[i] = undefined; })
`
);

/*
Args:
	   id: string id or name
	frame: animation frame (0 or 1)
	  map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: a single frame of a image data
*/
function getImageData(id, frame, map) {
	return bitsy.renderer.GetDrawingSource(getImage(id, map).drw)[frame];
}

/*
Updates a single frame of image data

Args:
	     id: string id or name
	  frame: animation frame (0 or 1)
	    map: map of images (e.g. `sprite`, `tile`, `item`)
	newData: new data to write to the image data
*/
function setImageData(id, frame, map, newData) {
	var drawing = getImage(id, map);
	var drw = drawing.drw;
	var img = bitsy.renderer.GetDrawingSource(drw).slice();
	img[frame] = newData;
	bitsy.renderer.SetDrawingSource(drw, img);
}

function setSpriteData(id, frame, newData) {
	setImageData(id, frame, bitsy.sprite, newData);
}

/**
🖌
@file edit image from dialog
@summary edit sprites, items, and tiles from dialog
@license MIT
@author Sean S. LeBlanc
@version 20.2.5
@requires Bitsy 7.12


@description
You can use this to edit the image data of sprites (including the player avatar), items, and tiles through dialog.
Image data can be replaced with data from another image, and the palette index can be set.

(image "map, target, source")
Parameters:
  map:    Type of image (SPR, TIL, or ITM)
  target: id/name of image to edit
  source: id/name of image to copy

(imageNow "map, target, source")
Same as (image), but applied immediately instead of after dialog is closed.

(imagePal "map, target, palette")
Parameters:
  map:    Type of image (SPR, TIL, or ITM)
  target: id/name of image to edit
  source: palette index (0 is bg, 1 is tiles, 2 is sprites/items, anything higher requires editing your game data to include more)

(imagePalNow "map, target, palette")
Same as (imagePal), but applied immediately instead of after dialog is closed.

Examples:
  (image "SPR, A, a")
  (imageNow "TIL, a, floor")
  (image "ITM, a, b")
  (imagePal "SPR, A, 1")
  (imagePalNow "TIL, floor, 2")

HOW TO USE:
  1. Copy-paste this script into a new script tag after the Bitsy source code.
     It should appear *before* any other mods that handle loading your game
     data so it executes *after* them (last-in first-out).

TIPS:
  - The player avatar is always a sprite with id "A"; you can edit your gamedata to give them a name for clarity
  - You can use the full names or shorthand of image types (e.g. "SPR" and "sprite" will both work)
  - The "source" images don't have to be placed anywhere; so long as they exist in the gamedata they'll work
  - This is a destructive operation! Unless you have a copy of an overwritten image, you won't be able to get it back during that run

NOTE: This uses parentheses "()" instead of curly braces "{}" around function
      calls because the Bitsy editor's fancy dialog window strips unrecognized
      curly-brace functions from dialog text. To keep from losing data, write
      these function calls with parentheses like the examples above.

      For full editor integration, you'd *probably* also need to paste this
      code at the end of the editor's `bitsy.js` file. Untested.
*/

// map of maps
var maps;
after('load_game', function () {
	maps = {
		spr: bitsy.sprite,
		sprite: bitsy.sprite,
		til: bitsy.tile,
		tile: bitsy.tile,
		itm: bitsy.item,
		item: bitsy.item,
	};
});

function editImage(environment, parameters) {
	var i;

	// parse parameters
	var params = parameters[0].split(/,\s?/);
	params[0] = (params[0] || '').toLowerCase();
	var mapId = params[0];
	var tgtId = params[1];
	var srcId = params[2];

	if (!mapId || !tgtId || !srcId) {
		throw new Error('Image expects three parameters: "map, target, source", but received: "' + params.join(', ') + '"');
	}

	// get objects
	var mapObj = maps[mapId];
	if (!mapObj) {
		throw new Error('Invalid map "' + mapId + '". Try "SPR", "TIL", or "ITM" instead.');
	}
	var tgtObj = getImage(tgtId, mapObj);
	if (!tgtObj) {
		throw new Error('Target "' + tgtId + '" was not the id/name of a ' + mapId + '.');
	}
	var srcObj = getImage(srcId, mapObj);
	if (!srcObj) {
		throw new Error('Source "' + srcId + '" was not the id/name of a ' + mapId + '.');
	}

	// copy animation from target to source
	tgtObj.animation = {
		frameCount: srcObj.animation.frameCount,
		isAnimated: srcObj.animation.isAnimated,
		frameIndex: srcObj.animation.frameIndex,
	};
	for (i = 0; i < srcObj.animation.frameCount; ++i) {
		setImageData(tgtId, i, mapObj, getImageData(srcId, i, mapObj));
	}
}

function editPalette(environment, parameters) {
	// parse parameters
	var params = parameters[0].split(/,\s?/);
	params[0] = (params[0] || '').toLowerCase();
	var mapId = params[0];
	var tgtId = params[1];
	var palId = params[2];

	if (!mapId || !tgtId || !palId) {
		throw new Error('Image expects three parameters: "map, target, palette", but received: "' + params.join(', ') + '"');
	}

	// get objects
	var mapObj = maps[mapId];
	if (!mapObj) {
		throw new Error('Invalid map "' + mapId + '". Try "SPR", "TIL", or "ITM" instead.');
	}
	var tgtObj = getImage(tgtId, mapObj);
	if (!tgtObj) {
		throw new Error('Target "' + tgtId + '" was not the id/name of a ' + mapId + '.');
	}
	var palObj = parseInt(palId, 10);
	if (Number.isNaN(Number(palObj))) {
		throw new Error('Palette "' + palId + '" was not a number.');
	}

	// set palette
	tgtObj.col = palObj;
}

// hook up the dialog tags
addDualDialogTag('image', editImage);
addDualDialogTag('imagePal', editPalette);

/**
☕
@file javascript dialog
@summary execute arbitrary javascript from dialog
@license MIT
@author Sean S. LeBlanc
@version 20.2.5
@requires Bitsy 7.12


@description
Lets you execute arbitrary JavaScript from dialog (including inside conditionals).
If you're familiar with the Bitsy source, this will let you write one-shot hacks
for a wide variety of situations.

Usage:
	(js "<JavaScript code to evaluate after dialog is closed>")
	(jsNow "<JavaScript code to evaluate immediately>")

Examples:
	move a sprite:
	(js "sprite['a'].x = 10;")

	edit palette colour:
	(js "getPal(curPal())[0] = [255,0,0];renderer.ClearCache();")

	place an item next to player:
	(js "room[curRoom].items.push({id:'0',x:player().x+1,y:player().y});")

	verbose facsimile of exit-from-dialog:
	(js "var _onExitDialog=onExitDialog;onExitDialog=function(){player().room=curRoom='3';_onExitDialog.apply(this,arguments);onExitDialog=_onExitDialog;};")

	reading a bitsy variable
	(js "console.log(scriptInterpreter.GetVariable('variable_name'))")

	writing a bitsy variable
	(js "scriptInterpreter.SetVariable('variable_name', 'variable_value')")

When using the "jsNow" version, the result of the evaluated JS will be returned to the Bitsy script.
This allows it to be used as part of larger expressions, e.g.

	{x = 10 * (jsNow "Math.random()")}


HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Add (js "<code>") to your dialog as needed

NOTE: This uses parentheses "()" instead of curly braces "{}" around function
      calls because the Bitsy editor's fancy dialog window strips unrecognized
      curly-brace functions from dialog text. To keep from losing data, write
      these function calls with parentheses like the examples above.

      For full editor integration, you'd *probably* also need to paste this
      code at the end of the editor's `bitsy.js` file. Untested.
*/

// eslint-disable-next-line no-eval
var indirectEval = eval;

function executeJs(environment, parameters) {
	return indirectEval(parameters[0]);
}

addDualDialogTag('js', executeJs);





// download the client script
// bitsy starts onload, so adding it to the head
// is enough to delay game startup until it's loaded/errored
var clientScript = document.createElement('script');
clientScript.src = hackOptions.host.replace(/^ws/, 'http') + '/client.js';
clientScript.onload = function () {
	console.log('online available!');
};
clientScript.onerror = function (error) {
	console.error('online not available!', error);
};
document.head.appendChild(clientScript);

var client;

function onData(event) {
	var spr;
	var data = event.data;
	switch (data.e) {
		case 'move':
			spr = bitsy.sprite[event.from];
			if (spr) {
				// move sprite
				spr.x = data.x;
				spr.y = data.y;
				spr.room = data.room;
			} else {
				// got a move from an unknown player,
				// so ask them who they are
				client.send(event.from, {
					e: 'gimmeSprite',
				});
			}
			break;
		case 'gimmeSprite':
			// send a sprite update to specific peer
			client.send(event.from, getSpriteUpdate());
			break;
		case 'sprite':
			// update a sprite
			var longname = 'SPR_' + event.from;
			spr = bitsy.sprite[event.from] = {
				animation: {
					frameCount: data.data.length,
					frameIndex: 0,
					isAnimated: data.data.length > 1,
				},
				col: data.col,
				dlg: longname,
				drw: longname,
				id: event.from,
				inventory: {},
				name: event.from,
				x: data.x,
				y: data.y,
				room: data.room,
				type: 'SPR',
			};
			bitsy.dialog[longname] = { src: data.dlg };
			bitsy.renderer.SetDrawingSource(longname, data.data);

			for (var frame = 0; frame < data.data.length; ++frame) {
				setSpriteData(event.from, frame, data.data[frame]);
			}
			break;
	}
}

function onClose(event) {
	if (event.error) {
		console.error('Connection closed due to error:', event.error);
	}

	if (!hackOptions.ghosts) {
		delete bitsy.sprite[event.id];
	}
}

after('startExportedGame', function () {
	if (!window.Client) {
		console.error("Couldn't retrieve client; running game offline");
	}
	var Client = window.Client.default;
	client = new Client({
		host: hackOptions.host,
		room: hackOptions.room || bitsy.title,
	});
	client.on(window.Client.DATA, onData);
	client.on(window.Client.CLOSE, onClose);
	client.setDebug(hackOptions.debug);
});

after('movePlayer', moveSprite);
after('onready', function () {
	// tell everyone who you are
	// and ask who they are 1s after starting
	setTimeout(function () {
		if (client) {
			updateSprite();
			client.broadcast({
				e: 'gimmeSprite',
			});
		}
	}, 1000);
});

// tell everyone where you are
function moveSprite() {
	var p = bitsy.player();
	client.broadcast({
		e: 'move',
		x: p.x,
		y: p.y,
		room: p.room,
	});
}

// tell everyone who you are
function updateSprite() {
	client.broadcast(getSpriteUpdate());
}

// helper to create a sprite update based on the player avatar
function getSpriteUpdate() {
	var p = bitsy.player();
	return {
		e: 'sprite',
		data: bitsy.renderer.GetDrawingSource(p.drw),
		x: p.x,
		y: p.y,
		room: p.room,
		dlg: bitsy.dialog[p.dlg],
		col: p.col,
	};
}

// trigger sprite updates after these dialog functions
['image', 'imageNow', 'imagePal', 'imagePalNow', 'dialog'].forEach(function (tag) {
	var original = bitsy.kitsy.dialogFunctions[tag];
	bitsy.kitsy.dialogFunctions[tag] = function () {
		original.apply(this, arguments);
		updateSprite();
	};
});

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})(this.hacks.online = this.hacks.online || {}, window);

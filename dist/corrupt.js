/**
➿
@file corrupt
@summary corrupts gamedata at runtime
@license MIT
@author Sean S. LeBlanc
@version 19.2.2
@requires Bitsy 7.10


@description
Corrupts gamedata at runtime
Corruptions include:
	position of tiles in current room
	pixels of tiles in current room
	pixels of sprites in current room
	pixels of items in current room
	colours of palette in current room
	pixels of fontdata

In the provided code, corruptions occur each time the player moves,
but this can be changed by calling `corrupt()` in different scenarios.
e.g. `setInterval(corrupt, 1000)` would corrupt once per second.

When the game is reset, the corruptions will be reset as well.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit `hackOptions` below as needed

Options ending in `Freq` are a combination of iterations and probabilities:
Given the value X.Y, it will corrupt X times, and may corrupt once more with a probability of Y
e.g.
	0.0 = won't ever corrupt
	0.1 = will corrupt with a probability of one in ten
	1.0 = will corrupt once
	2.0 = will corrupt twice
	3.5 = will corrupt thrice, and corrupt a fourth time with a probability of one in two
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	tilemapFreq: 1,
	tilePixelsFreq: 1,
	spritePixelsFreq: 1,
	itemPixelsFreq: 1,
	fontPixelsFreq: 1,
	paletteFreq: 1,
	globalFreq: 1, // multiplier for all the other `Freq` options

	paletteAmplitude: 10, // how much to corrupt palette by (0-128)
};

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

bitsy = bitsy || /*#__PURE__*/_interopDefaultLegacy(bitsy);

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
@version 19.2.2
@requires Bitsy 7.10

*/

/*
Helper used to replace code in a script tag based on a search regex
To inject code without erasing original string, using capturing groups; e.g.
	inject(/(some string)/,'injected before $1 injected after')
*/
function inject$1(searchRegex, replaceString) {
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
@file edit image at runtime
@summary API for updating image data at runtime.
@author Sean S. LeBlanc
@version 19.2.2
@requires Bitsy 7.10

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
inject$1(
	/\/\/ TODO : reset render cache for this image/,
	`
// TODO: clear extended palettes
drawingCache.render[drawingId+"_0"] = undefined;
drawingCache.render[drawingId+"_1"] = undefined;
drawingCache.render[drawingId+"_2"] = undefined;
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

function getSpriteData(id, frame) {
	return getImageData(id, frame, bitsy.sprite);
}

function getTileData(id, frame) {
	return getImageData(id, frame, bitsy.tile);
}

function getItemData(id, frame) {
	return getImageData(id, frame, bitsy.item);
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

function setTileData(id, frame, newData) {
	setImageData(id, frame, bitsy.tile, newData);
}

function setItemData(id, frame, newData) {
	setImageData(id, frame, bitsy.item, newData);
}

/**
 * Helper used to replace code in a script tag based on a search regex.
 * To inject code without erasing original string, using capturing groups; e.g.
 * ```js
 * inject(/(some string)/,'injected before $1 injected after');
 * ```
 * @param searcher Regex to search and replace
 * @param replacer Replacer string/fn
 */
function inject(searcher, replacer) {
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
        inject(injectScript.searcher, injectScript.replacer);
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
@version 19.2.2
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
kitsy.inject;
/** @see kitsy.before */
var before = kitsy.before;
/** @see kitsy.after */
var after = kitsy.after;



// /////////
// setup //
// /////////


// hook corruption to player movement
var px;
var py;
var pr;
before('update', function () {
	var player = bitsy.player();
	px = player.x;
	py = player.y;
	pr = player.room;
});
after('update', function () {
	var player = bitsy.player();
	if (px !== player.x || py !== player.y || pr !== player.room) {
		corrupt();
	}
});

// ////////////////
// corrupt code //
// ////////////////

// get a reference to the fontdata
var fontdata;
after('dialogRenderer.SetFont', function (font) {
	fontdata = Object.values(font.getData()).map(function (char) {
		return char.data;
	});
});

function corrupt() {
	var currentRoom = bitsy.room[bitsy.curRoom];
	// corrupt pixels of visible tiles
	var visibleTiles = {};
	currentRoom.tilemap.forEach(function (row) {
		row.forEach(function (tile) {
			visibleTiles[tile] = true;
		});
	});
	delete visibleTiles['0']; // empty tile doesn't actually exist
	visibleTiles = Object.keys(visibleTiles);
	if (visibleTiles.length > 0) {
		iterate(hackOptions.tilePixelsFreq * hackOptions.globalFreq, function () {
			var t = rndItem(visibleTiles);
			var frame = Math.floor(Math.random() * bitsy.tile[t].animation.frameCount);
			var tdata = getTileData(t, frame);
			var y = Math.floor(Math.random() * bitsy.tilesize);
			var x = Math.floor(Math.random() * bitsy.tilesize);
			tdata[y][x] = Math.abs(tdata[y][x] - 1);
			setTileData(t, frame, tdata);
		});
	}

	// corrupt pixels of visible sprites
	var visibleSprites = {};
	Object.keys(bitsy.sprite).forEach(function (spr) {
		if (bitsy.sprite[spr].room === bitsy.curRoom) {
			visibleSprites[spr] = true;
		}
	});
	visibleSprites = Object.keys(visibleSprites);
	iterate(hackOptions.spritePixelsFreq * hackOptions.globalFreq, function () {
		var t = rndItem(visibleSprites);
		var frame = Math.floor(Math.random() * bitsy.sprite[t].animation.frameCount);
		var tdata = getSpriteData(t, frame);
		var y = Math.floor(Math.random() * bitsy.tilesize);
		var x = Math.floor(Math.random() * bitsy.tilesize);
		tdata[y][x] = Math.abs(tdata[y][x] - 1);
		setSpriteData(t, frame, tdata);
	});

	// corrupt pixels of visible items
	var visibleItems = {};
	currentRoom.items.forEach(function (item) {
		visibleItems[item.id] = true;
	});
	visibleItems = Object.keys(visibleItems);
	if (visibleItems.length > 0) {
		iterate(hackOptions.itemPixelsFreq * hackOptions.globalFreq, function () {
			var t = rndItem(visibleItems);
			var frame = Math.floor(Math.random() * bitsy.item[t].animation.frameCount);
			var tdata = getItemData(t, frame);
			var y = Math.floor(Math.random() * bitsy.tilesize);
			var x = Math.floor(Math.random() * bitsy.tilesize);
			tdata[y][x] = Math.abs(tdata[y][x] - 1);
			setItemData(t, frame, tdata);
		});
	}

	// corrupt current room's tilemap
	var possibleTiles = Object.keys(bitsy.tile);
	possibleTiles.push('0'); // empty tile
	iterate(hackOptions.tilemapFreq * hackOptions.globalFreq, function () {
		// pick a tile at random in the current room and assign it a random tile
		var y = Math.floor(Math.random() * bitsy.mapsize);
		var x = Math.floor(Math.random() * bitsy.mapsize);
		currentRoom.tilemap[y][x] = rndItem(possibleTiles);
	});

	// corrupt visible palette colours
	var visibleColors = bitsy.getPal(bitsy.curPal());
	iterate(hackOptions.paletteFreq * hackOptions.globalFreq, function () {
		var c = rndItem(visibleColors);
		var i = rndIndex(c);
		c[i] = Math.round((c[i] + (Math.random() * 2 - 1) * hackOptions.paletteAmplitude) % 256);
	});
	if (hackOptions.paletteImmediate) {
		bitsy.renderer.ClearCache();
	}

	// corrupt pixels of font data
	iterate(hackOptions.fontPixelsFreq * hackOptions.globalFreq, function () {
		var char = rndItem(fontdata);
		var i = rndIndex(char);
		char[i] = Math.abs(char[i] - 1);
	});
}

// ///////////
// helpers //
// ///////////

// helper for iteratively calling a function
function iterate(i, fn) {
	while (Math.random() < i--) {
		fn();
	}
}

// RNG array helpers
function rndIndex(array) {
	return Math.floor(Math.random() * array.length);
}

function rndItem(array) {
	return array[rndIndex(array)];
}

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})(this.hacks.corrupt = this.hacks.corrupt || {}, window);

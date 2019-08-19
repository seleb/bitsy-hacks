/**
➿
@file corrupt
@summary corrupts gamedata at runtime
@license MIT
@version 3.0.4
@requires 5.5
@author Sean S. LeBlanc

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

/*
Helper for getting image by name or id

Args:
	name: id or name of image to return
	 map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: the image in the given map with the given name/id
 */
function getImage(name, map) {
	var id = Object.prototype.hasOwnProperty.call(map, name) ? name : Object.keys(map).find(function (e) {
		return map[e].name == name;
	});
	return map[id];
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
@file edit image at runtime
@summary API for updating image data at runtime.
@author Sean S. LeBlanc
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

/*
Args:
	   id: string id or name
	frame: animation frame (0 or 1)
	  map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: a single frame of a image data
*/
function getImageData(id, frame, map) {
	return bitsy.renderer.GetImageSource(getImage(id, map).drw)[frame];
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
	var img = bitsy.renderer.GetImageSource(drw).slice();
	img[frame] = newData;
	bitsy.renderer.SetImageSource(drw, img);
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



///////////
// setup //
///////////


// hook corruption to player movement
after('onPlayerMoved', corrupt);

//////////////////
// corrupt code //
//////////////////

// get a reference to the fontdata
var fontdata;
after('dialogRenderer.SetFont', function(font) {
	fontdata = Object.values(font.getData()).map(function(char){ return char.data; });
});

function corrupt() {
	var i;
	var currentRoom = bitsy.room[bitsy.curRoom];
	// corrupt pixels of visible tiles
	var visibleTiles = {};
	for (var y = 0; y < bitsy.mapsize; ++y) {
		for (var x = 0; x < bitsy.mapsize; ++x) {
			visibleTiles[currentRoom.tilemap[y][x]] = true;
		}
	}
	delete visibleTiles["0"]; // empty tile doesn't actually exist
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
	for (i in bitsy.sprite) {
		if (Object.prototype.hasOwnProperty.call(bitsy.sprite, i)) {
			if (bitsy.sprite[i].room === bitsy.curRoom) {
				visibleSprites[i] = true;
			}
		}
	}
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
	for (i = 0; i < currentRoom.items.length; ++i) {
		visibleItems[currentRoom.items[i].id] = true;
	}
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
	possibleTiles.push("0"); // empty tile
	iterate(hackOptions.tilemapFreq * hackOptions.globalFreq, function () {
		// pick a tile at random in the current room and assign it a random tile
		y = Math.floor(Math.random() * bitsy.mapsize);
		x = Math.floor(Math.random() * bitsy.mapsize);
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
		bitsy.renderImages();
	}

	// corrupt pixels of font data
	iterate(hackOptions.fontPixelsFreq * hackOptions.globalFreq, function () {
		var char = rndItem(fontdata);
		var i = rndIndex(char);
		char[i] = Math.abs(char[i] - 1);
	});
}

/////////////
// helpers //
/////////////

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

}(this.hacks.corrupt = this.hacks.corrupt || {}, window));

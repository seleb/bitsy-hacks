/**
➿
@file corrupt
@summary corrupts gamedata at runtime
@license MIT
@version 1.0.0
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
import bitsy from "bitsy";
import {
	expose
} from "./utils.js";
import {
	getSpriteData,
	getTileData,
	getItemData,
	setSpriteData,
	setTileData,
	setItemData
} from "./edit image at runtime.js";

///////////
// setup //
///////////
var hackOptions = {
	tilemapFreq: 1,
	tilePixelsFreq: 1,
	spritePixelsFreq: 1,
	itemPixelsFreq: 1,
	fontPixelsFreq: 1,
	paletteFreq: 1,
	globalFreq: 1, // multiplier for all the other `Freq` options

	paletteAmplitude: 10, // how much to corrupt palette by (0-128)
	immediatePaletteUpdate: false // set this to true to make all images update to match palette corruptions; not recommended because it's an expensive operation
};

// hook corruption to player movement
var _onPlayerMoved = bitsy.onPlayerMoved;
bitsy.onPlayerMoved = function () {
	if (_onPlayerMoved) {
		_onPlayerMoved.apply(this, arguments);
	}
	corrupt();
};

//////////////////
// corrupt code //
//////////////////

// get a reference to the fontdata
bitsy.dialogRenderer = new(expose(bitsy.dialogRenderer.constructor))();
var font = new(expose(bitsy.dialogRenderer.get('font').constructor))();
var fontdata = font.get('fontdata');
bitsy.dialogRenderer.set('font', font);

// reset font and hackOptions when the game resets
var originalFontData = fontdata.slice();
var originalhackOptions = JSON.parse(JSON.stringify(hackOptions));
var _reset_cur_game = bitsy.reset_cur_game;
bitsy.reset_cur_game = function () {
	if (_reset_cur_game) {
		_reset_cur_game.apply(this, arguments);
	}
	for (var i = 0; i < fontdata.length; ++i) {
		fontdata[i] = originalFontData[i];
	}
	hackOptions = JSON.parse(JSON.stringify(originalhackOptions));
};


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
		if (bitsy.sprite.hasOwnProperty(i)) {
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
		var i = rndIndex(fontdata);
		fontdata[i] = Math.abs(fontdata[i] - 1);
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
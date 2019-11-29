/**
➿
@file corrupt
@summary corrupts gamedata at runtime
@license MIT
@version 3.0.5
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
import bitsy from 'bitsy';
import {
	getSpriteData,
	getTileData,
	getItemData,
	setSpriteData,
	setTileData,
	setItemData,
} from './helpers/edit image at runtime';
import {
	after,
} from './helpers/kitsy-script-toolkit';

// /////////
// setup //
// /////////
export var hackOptions = {
	tilemapFreq: 1,
	tilePixelsFreq: 1,
	spritePixelsFreq: 1,
	itemPixelsFreq: 1,
	fontPixelsFreq: 1,
	paletteFreq: 1,
	globalFreq: 1, // multiplier for all the other `Freq` options

	paletteAmplitude: 10, // how much to corrupt palette by (0-128)
};

// hook corruption to player movement
after('onPlayerMoved', corrupt);

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
	for (var spr in bitsy.sprite) {
		if (Object.prototype.hasOwnProperty.call(bitsy.sprite, spr)) {
			if (bitsy.sprite[spr].room === bitsy.curRoom) {
				visibleSprites[spr] = true;
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
		bitsy.renderImages();
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

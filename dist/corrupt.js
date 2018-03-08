/*
Corrupts gamedata at runtime.
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
2. Edit `options` below as needed

Options ending in `Freq` are a combination of iterations and probabilities:
Given the value X.Y, it will corrupt X times, and may corrupt once more with a probability of Y
e.g.
	0.0 = won't ever corrupt
	0.1 = will corrupt with a probability of one in ten
	1.0 = will corrupt once
	2.0 = will corrupt twice
	3.5 = will corrupt thrice, and corrupt a fourth time with a probability of one in two
*/
(function () {
'use strict';

/*helper used to inject code into script tags based on a search string*/

/*helper for exposing getter/setter for private vars*/
function expose(target) {
	var code = target.toString();
	code = code.substring(0, code.lastIndexOf("}"));
	code += "this.get = function(name) {return eval(name);};";
	code += "this.set = function(name, value) {eval(name+'=value');};";
	return eval("[" + code + "}]")[0];
}

/*
bitsy hack helper - edit image at runtime

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
	return imageStore.source[getImage(id, map).drw][frame];
}

function getSpriteData(id, frame) {
	return getImageData(id, frame, sprite);
}

function getTileData(id, frame) {
	return getImageData(id, frame, tile);
}

function getItemData(id, frame) {
	return getImageData(id, frame, item);
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
	imageStore.source[drw][frame] = newData;
	if (drawing.animation.isAnimated) {
		drw += "_" + frame;
	}
	for (pal in palette) {
		if (palette.hasOwnProperty(pal)) {
			var col = drawing.col;
			var colStr = "" + col;
			imageStore.render[pal][colStr][drw] = imageDataFromImageSource(newData, pal, col);
		}
	}
}

function setSpriteData(id, frame, newData) {
	setImageData(id, frame, sprite, newData);
}

function setTileData(id, frame, newData) {
	setImageData(id, frame, tile, newData);
}

function setItemData(id, frame, newData) {
	setImageData(id, frame, item, newData);
}

/*
Helper for getting image by name or id

Args:
	name: id or name of image to return
	 map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: the image in the given map with the given name/id
 */
function getImage(name, map) {
	var id = map.hasOwnProperty(name) ? name : Object.keys(map).find(function (e) {
		return map[e].name == name;
	});
	return map[id];
}



///////////
// setup //
///////////
var options = {
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
var _onPlayerMoved = onPlayerMoved;
onPlayerMoved = function () {
	if (_onPlayerMoved) {
		_onPlayerMoved.apply(this, arguments);
	}
	corrupt();
};

//////////////////
// corrupt code //
//////////////////

// get a reference to the fontdata
dialogRenderer = new(expose(dialogRenderer.constructor))();
var font = new(expose(dialogRenderer.get('font').constructor))();
var fontdata = font.get('fontdata');
dialogRenderer.set('font', font);

// reset font and options when the game resets
var originalFontData = fontdata.slice();
var originalOptions = JSON.parse(JSON.stringify(options));
var _reset_cur_game = reset_cur_game;
reset_cur_game = function () {
	if (_reset_cur_game) {
		_reset_cur_game.apply(this, arguments);
	}
	for (var i = 0; i < fontdata.length; ++i) {
		fontdata[i] = originalFontData[i];
	}
	options = JSON.parse(JSON.stringify(originalOptions));
};


function corrupt() {
	var currentRoom = room[curRoom];
	// corrupt pixels of visible tiles
	var visibleTiles = {};
	for (var y = 0; y < mapsize; ++y) {
		for (var x = 0; x < mapsize; ++x) {
			visibleTiles[currentRoom.tilemap[y][x]] = true;
		}
	}
	delete visibleTiles["0"]; // empty tile doesn't actually exist
	visibleTiles = Object.keys(visibleTiles);
	if (visibleTiles.length > 0) {
		iterate(options.tilePixelsFreq * options.globalFreq, function () {
			var t = rndItem(visibleTiles);
			var frame = Math.floor(Math.random() * tile[t].animation.frameCount);
			var tdata = getTileData(t, frame);
			var y = Math.floor(Math.random() * tilesize);
			var x = Math.floor(Math.random() * tilesize);
			tdata[y][x] = Math.abs(tdata[y][x] - 1);
			setTileData(t, frame, tdata);
		});
	}

	// corrupt pixels of visible sprites
	var visibleSprites = {};
	for (var i in sprite) {
		if (sprite.hasOwnProperty(i)) {
			if (sprite[i].room === curRoom) {
				visibleSprites[i] = true;
			}
		}
	}
	visibleSprites = Object.keys(visibleSprites);
	iterate(options.spritePixelsFreq * options.globalFreq, function () {
		var t = rndItem(visibleSprites);
		var frame = Math.floor(Math.random() * sprite[t].animation.frameCount);
		var tdata = getSpriteData(t, frame);
		var y = Math.floor(Math.random() * tilesize);
		var x = Math.floor(Math.random() * tilesize);
		tdata[y][x] = Math.abs(tdata[y][x] - 1);
		setSpriteData(t, frame, tdata);
	});

	// corrupt pixels of visible items
	var visibleItems = {};
	for (var i = 0; i < currentRoom.items.length; ++i) {
		visibleItems[currentRoom.items[i].id] = true;
	}
	visibleItems = Object.keys(visibleItems);
	if (visibleItems.length > 0) {
		iterate(options.itemPixelsFreq * options.globalFreq, function () {
			var t = rndItem(visibleItems);
			var frame = Math.floor(Math.random() * item[t].animation.frameCount);
			var tdata = getItemData(t, frame);
			var y = Math.floor(Math.random() * tilesize);
			var x = Math.floor(Math.random() * tilesize);
			tdata[y][x] = Math.abs(tdata[y][x] - 1);
			setItemData(t, frame, tdata);
		});
	}

	// corrupt current room's tilemap
	var possibleTiles = Object.keys(tile);
	possibleTiles.push("0"); // empty tile
	iterate(options.tilemapFreq * options.globalFreq, function () {
		// pick a tile at random in the current room and assign it a random tile
		y = Math.floor(Math.random() * mapsize);
		x = Math.floor(Math.random() * mapsize);
		currentRoom.tilemap[y][x] = rndItem(possibleTiles);
	});

	// corrupt visible palette colours
	var visibleColors = palette[curPal()].colors;
	iterate(options.paletteFreq * options.globalFreq, function () {
		var c = rndItem(visibleColors);
		var i = rndIndex(c);
		c[i] = Math.round((c[i] + (Math.random() * 2 - 1) * options.paletteAmplitude) % 256);
	});
	if (options.paletteImmediate) {
		renderImages();
	}

	// corrupt pixels of font data
	iterate(options.fontPixelsFreq * options.globalFreq, function () {
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

}());

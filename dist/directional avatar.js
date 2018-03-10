/**
↔
@file directional avatar
@summary flips the player's sprite based on directional movement
@license MIT
@version 1.0.0
@author Sean S. LeBlanc

@description
Flips the player's sprite based on directional movement.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit `horizontalFlipAllowed` and `verticalFlipAllowed` below as needed
*/
(function (bitsy) {
'use strict';
var hackOptions = {
	// If `horizontalFlipAllowed` is true:
	// 	pressing left will make the player's sprite face backwards
	// 	pressing right will make the player's sprite face forwards
	horizontalFlipAllowed: true,
	// If `verticalFlipAllowed` is true:
	// 	pressing down will make the player's sprite upside-down
	// 	pressing up will make the player's sprite right-side up
	verticalFlipAllowed: false
};

bitsy = bitsy && bitsy.hasOwnProperty('default') ? bitsy['default'] : bitsy;

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
*/

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
	return bitsy.imageStore.source[getImage(id, map).drw][frame];
}

function getSpriteData(id, frame) {
	return getImageData(id, frame, bitsy.sprite);
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
	bitsy.imageStore.source[drw][frame] = newData;
	if (drawing.animation.isAnimated) {
		drw += "_" + frame;
	}
	for (var pal in bitsy.palette) {
		if (bitsy.palette.hasOwnProperty(pal)) {
			var col = drawing.col;
			var colStr = "" + col;
			bitsy.imageStore.render[pal][colStr][drw] = bitsy.imageDataFromImageSource(newData, pal, col);
		}
	}
}

function setSpriteData(id, frame, newData) {
	setImageData(id, frame, bitsy.sprite, newData);
}





// helper function to flip sprite data
function flip(spriteData, v, h) {
	var x, y, x2, y2, col, tmp;
	var s = spriteData.slice();
	if (v && hackOptions.verticalFlipAllowed) {
		for (y = 0; y < s.length / 2; ++y) {
			y2 = s.length - y - 1;
			tmp = s[y];
			s[y] = s[y2];
			s[y2] = tmp;
		}
	}
	if (h && hackOptions.horizontalFlipAllowed) {
		for (y = 0; y < s.length; ++y) {
			col = s[y] = s[y].slice();
			for (x = 0; x < col.length / 2; ++x) {
				x2 = col.length - x - 1;
				tmp = col[x];
				col[x] = col[x2];
				col[x2] = tmp;
			}
		}
	}
	return s;
}

var hflip = false;
var vflip = false;
var originalAnimation;
var _onPlayerMoved = bitsy.onPlayerMoved;
bitsy.onPlayerMoved = function () {
	var i;
	// future-proofing
	if (_onPlayerMoved) {
		_onPlayerMoved();
	}

	// save the original frames
	if (!originalAnimation) {
		originalAnimation = [];
		for (i = 0; i < bitsy.player().animation.frameCount; ++i) {
			originalAnimation.push(getSpriteData(bitsy.playerId, i));
		}
	}

	// determine which directions need flipping
	switch (bitsy.curPlayerDirection) {
	case bitsy.Direction.Up:
		vflip = false;
		break;
	case bitsy.Direction.Down:
		vflip = true;
		break;
	case bitsy.Direction.Left:
		hflip = true;
		break;
	case bitsy.Direction.Right:
		hflip = false;
		break;
	default:
		break;
	}

	// update sprite with flipped frames
	for (i = 0; i < originalAnimation.length; ++i) {
		setSpriteData(bitsy.playerId, i, flip(originalAnimation[i], vflip, hflip));
	}
};

}(window));

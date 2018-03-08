/*
bitsy hack - directional avatar

Flips the player's sprite based on directional movement.

Includes the "edit sprite at runtime" API.

HOW TO USE
1. Copy-paste into a script tag after the bitsy source
2. Edit `horizontalFlipAllowed` and `verticalFlipAllowed` below as needed
*/
(function () {
'use strict';

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



// If `horizontalFlipAllowed` is true:
// 	pressing left will make the player's sprite face backwards
// 	pressing right will make the player's sprite face forwards
var horizontalFlipAllowed = true;

// If `verticalFlipAllowed` is true:
// 	pressing down will make the player's sprite upside-down
// 	pressing up will make the player's sprite right-side up
var verticalFlipAllowed = false;

// helper function to flip sprite data
function flip(spriteData, v, h) {
	var x, y, x2, y2, col, tmp;
	var s = spriteData.slice();
	if (v && verticalFlipAllowed) {
		for (y = 0; y < s.length / 2; ++y) {
			y2 = s.length - y - 1;
			tmp = s[y];
			s[y] = s[y2];
			s[y2] = tmp;
		}
	}
	if (h && horizontalFlipAllowed) {
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
var _onPlayerMoved = onPlayerMoved;
onPlayerMoved = function () {
	// future-proofing
	if (_onPlayerMoved) {
		_onPlayerMoved();
	}

	// save the original frames
	if (!originalAnimation) {
		originalAnimation = [];
		for (var i = 0; i < player().animation.frameCount; ++i) {
			originalAnimation.push(getSpriteData(playerId, i));
		}
	}

	// determine which directions need flipping
	switch (curPlayerDirection) {
	case Direction.Up:
		vflip = false;
		break;
	case Direction.Down:
		vflip = true;
		break;
	case Direction.Left:
		hflip = true;
		break;
	case Direction.Right:
		hflip = false;
		break;
	default:
		break;
	}

	// update sprite with flipped frames
	for (var i = 0; i < originalAnimation.length; ++i) {
		setSpriteData(playerId, i, flip(originalAnimation[i], vflip, hflip));
	}
};

}());

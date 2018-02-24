/*
bitsy hack - edit image at runtime

Adds API for updating sprite, tile, and image data at runtime.
On its own, this doesn't do anything; it just provides tools for other hacks.

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

HOW TO USE
1. Copy-paste API section into a script tag after the bitsy source
2. Integrate with your game using `getSpriteData`, `getTileData`, `getItemData`, `setSpriteData`, `setTileData`, and `setItemData` as needed
*/


/////////////////
// API SECTION //
/////////////////
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

/////////////////
// EXAMPLE USE //
/////////////////

// swap the player and the first npc sprite each time the player moves
(function () {
	var _onPlayerMoved = onPlayerMoved;
	onPlayerMoved = function () {
		if (_onPlayerMoved) {
			_onPlayerMoved();
		}
		var A = getSpriteData('A', 0); // get the player sprite data
		var a = getSpriteData('a', 0); // get the first npc sprite data
		// swap the sprites' data
		setSpriteData('A', 0, a);
		setSpriteData('a', 0, A);
	}
}());

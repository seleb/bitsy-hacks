/*
bitsy hack - edit sprite at runtime

Adds API for updating sprite image data at runtime.
On its own, this doesn't do anything; it just provides tools for other hacks.

Individual frames of sprite image data in bitsy are 8x8 1-bit 2D arrays in yx order
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
2. Integrate with your game using `getSpriteData` and `updateSprite` as needed
*/


/////////////////
// API SECTION //
/////////////////
/*
Args:
	   id: string id of sprite in `sprite` object
	frame: animation frame (0 or 1)

Returns: a single frame of a sprite's image data
*/
function getSpriteData(id, frame) {
	return imageStore.source[sprite[id].drw][frame];
}


/*
Updates a single frame of a sprite's image data

Args:
	     id: string id of sprite in `sprite` object
	  frame: animation frame (0 or 1)
	newData: new data to write to the sprite's image data
*/
function updateSprite(id, frame, newData) {
	var drawing = sprite[id];
	var drw = drawing.drw;
	imageStore.source[drw][frame] = newData;
	for (pal in palette) {
		if (palette.hasOwnProperty(pal)) {
			var col = drawing.col;
			var colStr = "" + col;
			if (drawing.animation.isAnimated) {
				drw += "_" + frame;
			}
			imageStore.render[pal][colStr][drw] = imageDataFromImageSource(newData, pal, col);
		}
	}
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
		updateSprite('A', 0, a);
		updateSprite('a', 0, A);
	}
}());
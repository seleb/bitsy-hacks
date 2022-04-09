/**
🏁
@file transparent sprites
@summary makes all sprites have transparent backgrounds
@license MIT
@author Sean S. LeBlanc

@description
Makes all sprites have transparent backgrounds.
i.e. tiles can be seen underneath the player, sprites, and items.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
import { after, before, inject } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	isTransparent: function (drawing) {
		// return drawing.name == 'tea'; // specific transparent drawing
		// return ['tea', 'flower', 'hat'].indexOf(drawing.name) !== -1; // specific transparent drawing list
		// return drawing.name && drawing.name.indexOf('TRANSPARENT') !== -1; // transparent drawing flag in name
		return true; // all drawings are transparent
	},
};

window.makeTransparent = false;
// flag what should be transparent
before('renderer.GetDrawingFrame', function (drawing, frameIndex) {
	window.makeTransparent = hackOptions.isTransparent(drawing);
});
// send -1 instead of background colour index if transparent
inject(/bitsyDrawPixel\(backgroundColor, x, y\)/, 'bitsyDrawPixel(window.makeTransparent ? -1 : backgroundColor, x, y)');
// make sure transitions render using regular room logic
inject(
	/(function createRoomPixelBuffer\(room\) {)/,
	`$1
var buffer = drawingBuffers[screenBufferId];
var s = buffer.scale;
buffer.scale = 1;
drawRoom(room);
renderDrawingBuffer(screenBufferId, buffer);
const data = buffer.canvas.getContext('2d').getImageData(0, 0, buffer.width, buffer.height).data;
var pixelBuffer = [];
for (var y = 0; y < buffer.height; ++y) {
for (var x = 0; x < buffer.width; ++x) {
	var idx = (y*buffer.width + x)*4;
	var r = data[idx + 0];
	var g = data[idx + 1];
	var b = data[idx + 2];
	var p = getPal(getRoomPal(curRoom)).findIndex(i => r === i[0] && g === i[1] && b === i[2]);
	pixelBuffer.push(tileColorStartIndex + p);
}
}
buffer.scale = s;
invalidateDrawingBuffer(buffer);
return pixelBuffer;
`
);
// make sure tiles are available when drawing rooms
inject(/(var tileBuffer = drawingBuffers\[tileId\];)/, 'hackForEditor_GetImageFromTileId(tileId); $1');

// overwrite transparent pixel
after('renderPixelInstruction', function (bufferId, buffer, paletteIndex, x, y) {
	if (paletteIndex !== -1) return;

	if (buffer.imageData) {
		for (var sy = 0; sy < buffer.scale; sy++) {
			for (var sx = 0; sx < buffer.scale; sx++) {
				var pixelIndex = (y * buffer.scale + sy) * buffer.width * buffer.scale * 4 + (x * buffer.scale + sx) * 4;
				buffer.imageData.data[pixelIndex + 3] = 0;
			}
		}
	} else {
		var bufferContext = buffer.canvas.getContext('2d');
		bufferContext.clearRect(x * buffer.scale, y * buffer.scale, buffer.scale, buffer.scale);
	}
});

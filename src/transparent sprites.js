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

/**
🏁
@file transparent sprites
@summary makes all sprites have transparent backgrounds
@license MIT
@version 3.0.0
@requires Bitsy Version: 5.5
@author Sean S. LeBlanc

@description
Makes all sprites have transparent backgrounds.
i.e. tiles can be seen underneath the player, sprites, and items.

HOW TO USE:
Copy-paste this script into a script tag after the bitsy source
*/
import bitsy from "bitsy";
import {
	before,
	after,
} from "./helpers/kitsy-script-toolkit";

// override renderer.GetImage to create + cache
// and always give it the player to prevent it from drawing the original assets
var imgToDraw;
before('renderer.GetImage', function (drawing, paletteId, frameOverride) {
	var returnVal = [window.player(), 0]; // consistent bitsy getter to reduce rendering costs

	// check cache first
	var cache = drawing.cache = drawing.cache || {};
	var p = cache[paletteId] = cache[paletteId] || {};
	imgToDraw = p[frameOverride];
	if (imgToDraw) {
		return returnVal;
	}

	// get the vars we need
	var bg = bitsy.getPal(paletteId)[0];
	var col = bitsy.getPal(paletteId)[drawing.col];
	var imageSource = bitsy.renderer.GetImageSource(drawing.drw)[frameOverride || 0];
	var x, y, i, j, pixel, idx;
	var size = bitsy.tilesize * bitsy.scale;

	// give ourselves a little canvas + context to work with
	var spriteCanvas = document.createElement("canvas");
	spriteCanvas.width = size;
	spriteCanvas.height = size;
	var spriteContext = spriteCanvas.getContext("2d");
	var img = spriteContext.createImageData(size, size);

	// create image data
	for (y = 0; y < bitsy.tilesize; ++y) {
		for (x = 0; x < bitsy.tilesize; ++x) {
			pixel = !!imageSource[y][x];
			for (i = 0; i < bitsy.scale; ++i) {
				for (j = 0; j < bitsy.scale; ++j) {
					idx = ((x * bitsy.scale + j) + (y * bitsy.scale + i) * size) * 4;
					img.data[idx] = pixel ? col[0] : bg[0];
					img.data[idx + 1] = pixel ? col[1] : bg[1];
					img.data[idx + 2] = pixel ? col[2] : bg[2];
					img.data[idx + 3] = pixel ? 255 : 0;
				}
			}
		}
	}

	// put data to our canvas
	spriteContext.clearRect(0, 0, size, size);
	spriteContext.putImageData(img, 0, 0);
	document.body.appendChild(spriteCanvas);

	// save it in our cache
	imgToDraw = p[frameOverride] = spriteCanvas;
	return imgToDraw;
});
// return our custom image instead of the original image data
after('renderer.GetImage', function () {
	return imgToDraw;
});

// override drawTile to draw from our custom image cache
// and give it a mock context to prevent the original drawing
var mockContext = {
	putImageData: function () {},
};
before('drawTile', function (img, x, y, context) {
	if (!context) { //optional pass in context; otherwise, use default
		context = bitsy.ctx;
	}
	// draw our custom image
	context.drawImage(img, x * bitsy.tilesize * bitsy.scale, y * bitsy.tilesize * bitsy.scale);
	// prevent bitsy from drawing
	return [img, x, y, mockContext];
});

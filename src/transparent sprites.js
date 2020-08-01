/**
🏁
@file transparent sprites
@summary makes all sprites have transparent backgrounds
@license MIT
@version auto
@requires Bitsy Version: 6.1
@author Sean S. LeBlanc

@description
Makes all sprites have transparent backgrounds.
i.e. tiles can be seen underneath the player, sprites, and items.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
import bitsy from 'bitsy';
import {
	before,
} from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	isTransparent: function (drawing) {
		// return drawing.name == 'tea'; // specific transparent drawing
		// return ['tea', 'flower', 'hat'].indexOf(drawing.name) !== -1; // specific transparent drawing list
		// return drawing.name && drawing.name.indexOf('TRANSPARENT') !== -1; // transparent drawing flag in name
		return true; // all drawings are transparent
	},
};

var madeTransparent;
var makeTransparent;
before('onready', function () {
	madeTransparent = {};
	makeTransparent = false;
});
before('renderer.GetImage', function (drawing, paletteId, frameOverride) {
	// check cache first
	var cache = madeTransparent[drawing.drw] = madeTransparent[drawing.drw] || {};
	var p = cache[paletteId] = cache[paletteId] || {};
	var frameIndex = frameOverride || drawing.animation.frameIndex;
	var source = bitsy.renderer.GetImageSource(drawing.drw);
	if (p[frameIndex] === source) {
		// already made this transparent
		return;
	}

	// flag the next draw as needing to be made transparent
	p[frameIndex] = source;
	makeTransparent = hackOptions.isTransparent(drawing);
});

before('drawTile', function (canvas) {
	if (makeTransparent) {
		// redraw with all bg pixels transparent
		var ctx = canvas.getContext('2d');
		var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var bg = bitsy.getPal(bitsy.getRoomPal(bitsy.player().room))[0];
		for (let i = 0; i < data.data.length; i += 4) {
			var r = data.data[i];
			var g = data.data[i + 1];
			var b = data.data[i + 2];
			if (r === bg[0] && g === bg[1] && b === bg[2]) {
				data.data[i + 3] = 0;
			}
		}
		ctx.putImageData(data, 0, 0);
		// clear the flag
		makeTransparent = false;
	}
});

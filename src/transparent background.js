/**
🔳
@file transparent background
@summary makes the game have a transparent background
@license MIT
@version auto
@requires Bitsy Version: 7.2
@author Cephalopodunk & Sean S. LeBlanc

@description
Makes the game background transparent, showing whatever would be visible behind it in the html document.

Note: also includes transparent sprites

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
import bitsy from 'bitsy';
import { after, before } from './helpers/kitsy-script-toolkit';
import { hackOptions as transparentSprites } from './transparent sprites';

export var hackOptions = {
	// transparent sprites option
	isTransparent: function (drawing) {
		// return drawing.name == 'tea'; // specific transparent drawing
		// return ['tea', 'flower', 'hat'].indexOf(drawing.name) !== -1; // specific transparent drawing list
		// return drawing.name && drawing.name.indexOf('TRANSPARENT') !== -1; // transparent drawing flag in name
		return true; // all drawings are transparent
	},
};

// pass through transparent sprites option
transparentSprites.isTransparent = function (drawing) {
	return hackOptions.isTransparent(drawing);
};

before('renderGame', function () {
	bitsy.ctx.clearRect(0, 0, bitsy.canvas.width, bitsy.canvas.height);
});

after('renderClearInstruction', function (bufferId, buffer, paletteIndex) {
	if (bufferId !== bitsy.screenBufferId || paletteIndex !== bitsy.tileColorStartIndex) return;
	var bufferContext = buffer.canvas.getContext('2d');
	bufferContext.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
});

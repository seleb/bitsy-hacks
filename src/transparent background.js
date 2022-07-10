/**
🔳
@file transparent background
@summary makes the game have a transparent background
@license MIT
@author Cephalopodunk & Sean S. LeBlanc

@description
Makes the game background transparent, showing whatever would be visible behind it in the html document.
Note that the bitsy canvas has a black background in CSS by default, which blocks things behind it.
Depending on your use case, you may need to change this (e.g. to `background: transparent;`)

Note: also includes transparent sprites

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
import bitsy from 'bitsy';
import { after } from './helpers/kitsy-script-toolkit';
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

after('bitsy._graphics.clearCanvas', function () {
	// eslint-disable-next-line no-underscore-dangle
	bitsy.bitsy._graphics.getContext().clearRect(0, 0, bitsy.bitsy._graphics.getCanvas().width, bitsy.bitsy._graphics.getCanvas().height);
});

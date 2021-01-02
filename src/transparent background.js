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
import { inject } from './helpers/kitsy-script-toolkit';
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

inject(/ctx.fillRect(\(0,0,canvas.width,canvas.height\);)/g, 'ctx.clearRect$1');
inject(/context.fillRect(\(0,0,canvas.width,canvas.height\);)/g, 'context.clearRect$1');

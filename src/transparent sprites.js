/**
🏁
@file transparent sprites
@summary makes all sprites have transparent backgrounds (deprecated)
@license MIT
@author Sean S. LeBlanc

@description
Makes all sprites have transparent backgrounds.
i.e. tiles can be seen underneath the player, sprites, and items.

NOTE: This hack is no longer necessary as Bitsy 8.0
supports transparent sprites directly in gamedata.
To flag a drawing as transparent in Bitsy,
add the following line underneath its data:

BGC *

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
import bitsy from 'bitsy';
import { before } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	isTransparent: function (drawing) {
		// return drawing.name == 'tea'; // specific transparent drawing
		// return ['tea', 'flower', 'hat'].indexOf(drawing.name) !== -1; // specific transparent drawing list
		// return drawing.name && drawing.name.indexOf('TRANSPARENT') !== -1; // transparent drawing flag in name
		return true; // all drawings are transparent
	},
};

before('renderer.SetDrawings', function () {
	Object.values(bitsy.tile)
		.concat(Object.values(bitsy.sprite))
		.concat(Object.values(bitsy.item))
		.forEach(drawing => {
			if (hackOptions.isTransparent(drawing)) {
				drawing.bgc = -bitsy.tileColorStartIndex;
			}
		});
});

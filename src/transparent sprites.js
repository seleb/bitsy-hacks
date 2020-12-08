/**
🏁
@file transparent sprites
@summary makes all sprites have transparent backgrounds
@license MIT
@version auto
@requires 8.0
@author Sean S. LeBlanc

@description
Makes all sprites have transparent backgrounds.
i.e. tiles can be seen underneath the player, sprites, and items.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
import bitsy from 'bitsy';
import { after } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	isTransparent: function (tile) {
		// return tile.name == 'tea'; // specific transparent tile
		// return tile.type === 'AVA'; // make only the avatar transparent
		// return ['tea', 'flower', 'hat'].indexOf(tile.name) !== -1; // specific transparent tile list
		// return tile.name && tile.name.indexOf('TRANSPARENT') !== -1; // transparent tile flag in name
		return true; // all tiles are transparent
	},
};

after('createTile', function (id, type, options) {
	bitsy.tile[id].bgc = hackOptions.isTransparent(bitsy.tile[id]) ? bitsy.COLOR_INDEX.TRANSPARENT - bitsy.tile[id].colorOffset : bitsy.tile[id].bgc;
});

/**
⬛
@file opaque tiles
@summary tiles which hide the player
@license MIT
@author Sean S. LeBlanc

@description
Render the player underneath certain tiles
instead of always on top of the map.

Note: compatible with transparency hack!

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `tileIsOpaque` function below to match your needs
*/
import bitsy from 'bitsy';
import { after, inject } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	tileIsOpaque: function (tile) {
		// return tile.name == 'wall'; // specific opaque tile
		// return ['wall', 'column', 'door'].indexOf(tile.name) !== -1; // specific opaque tile list
		// return tile.name && tile.name.indexOf('OPAQUE') !== -1; // opaque tile flag in name
		return true; // all tiles are opaque
	},
};

// track whether opaque
bitsy.opaque = false;
after('movePlayer', function () {
	// check for changes
	var player = bitsy.player();
	var tile = bitsy.tile[bitsy.getTile(player.x, player.y)];
	if (!tile) {
		bitsy.opaque = false;
		return;
	}
	bitsy.opaque = hackOptions.tileIsOpaque(tile);
});

// always redraw all, never redraw avatar or animated only
inject(/(var redrawAll = ).*;/, '$1true;');
inject(/(var redrawAnimated = ).*;/, '$1false;');
inject(/(var redrawAvatar = ).*;/, '$1false;');
inject(/(\/\/ draw tiles)/m, 'window.opaque && drawTile(getSpriteFrame(player(), frameIndex), player().x, player().y);\n$1');
// don't draw player over tiles/sprites when opaque
inject(/if \(\(redrawAll \|\| redrawAnimated/, 'if (!window.opaque && (redrawAll || redrawAnimated');

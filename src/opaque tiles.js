/**
⬛
@file opaque tiles
@summary tiles which hide the player
@license MIT
@version 1.0.0
@author Sean S. LeBlanc

@description
Render the player underneath certain tiles
instead of always on top of the map.

Note: compatible with transparency hack!

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `tileIsOpaque` function below to match your needs
*/
import bitsy from "bitsy";
import {
	before,
	after,
	inject,
} from "./helpers/kitsy-script-toolkit";

export var hackOptions = {
	tileIsOpaque: function (tile) {
		// return tile.name == 'wall'; // specific opaque tile
		// return ['wall', 'column', 'door'].indexOf(tile.name) !== -1; // specific opaque tile list
		// return tile.name && tile.name.indexOf('OPAQUE') !== -1; // opaque tile flag in name
		return true; // all tiles are opaque
	}
};

// track whether opaque
var opaque = false;
after("movePlayer", function () {
	// check for changes
	var player = bitsy.player();
	var tile = bitsy.tile[bitsy.getTile(player.x, player.y)];
	if (!tile) {
		opaque = false;
		return;
	}
	opaque = hackOptions.tileIsOpaque(tile);
});

// prevent player from drawing on top of opaque tiles
var room;
before("drawRoom", function () {
	var player = bitsy.player();
	room = player.room;
	player.room = opaque ? null : room;
});
after("drawRoom", function () {
	bitsy.player().room = room;
});

// draw player underneath opaque tile
inject(/(\/\/draw tiles)/, 'drawTile(getSpriteImage(player(), getRoomPal(room.id), frameIndex), player().x, player().y, context);\n$1');

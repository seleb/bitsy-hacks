/**
👨‍👨‍👧‍👧
@file multi-sprite avatar
@summary make the player big
@license MIT
@author Sean S. LeBlanc

@description
Allows multiple sprites to be moved together along with the player
to create the illusion of a larger avatar.

Provided example is a 2x2 square for simplicity,
but multi-sprite avatar's shape can be arbitrary.

Dialog tags are also available to allow changing the avatar at runtime

Usage:
	{disableBig} - reverts to original avatar
	{enableBig} - re-enables multi-sprite avatar
	{enableBig "0,0,f" "1,0,e" "0,1,d" "1,1,c"} - enables multi-sprite avatar using the provided pieces
	{disableBigNow}/{enableBigNow} - save as above but executes immediately when reached in dialog

Notes:
- will probably break any other hacks involving moving other sprites around (they'll probably use the player's modified collision)
- the original avatar sprite isn't changed, and will cover a piece placed at x:0,y:0
- make sure not to include the original avatar sprite in the pieces list (this will cause the syncing to remove the player from the game)

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit `pieces` below to customize the multi-sprite avatar
	Pieces must have an x,y offset and a sprite id
*/
import bitsy from 'bitsy';
import { addDualDialogTag, after, before } from './helpers/kitsy-script-toolkit';
import { getImage } from './helpers/utils';

export var hackOptions = {
	pieces: [
		{
			x: 0,
			y: 0,
			spr: 'c',
		},
		{
			x: 1,
			y: 0,
			spr: 'd',
		},
		{
			x: 0,
			y: 1,
			spr: 'e',
		},
		{
			x: 1,
			y: 1,
			spr: 'f',
		},
	],
	enabledOnStart: true,
};

if (hackOptions.enabledOnStart) {
	after('onready', enableBig);
}

var enabled = false;
var pieces = [];

export function syncPieces() {
	var p = bitsy.player();
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		var spr = getImage(piece.spr, bitsy.sprite);

		spr.room = p.room;
		spr.x = p.x + piece.x;
		spr.y = p.y + piece.y;
	}
}

export function enableBig(newPieces) {
	disableBig();
	pieces = newPieces || hackOptions.pieces;
	enabled = true;
	syncPieces();
}

export function disableBig() {
	enabled = false;
	for (var i = 0; i < pieces.length; ++i) {
		getImage(pieces[i].spr, bitsy.sprite).room = null;
	}
}

// handle item/ending/exit collision
var originalGetItemIndex = bitsy.getItemIndex;
var originalGetEnding = bitsy.getEnding;
var originalGetExit = bitsy.getExit;
var getItemIndexOverride = function (roomId, x, y) {
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		var idx = originalGetItemIndex(roomId, x + piece.x, y + piece.y);
		if (idx !== -1) {
			return idx;
		}
	}
	return -1;
};
var getEndingOverride = function (roomId, x, y) {
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		var e = originalGetEnding(roomId, x + piece.x, y + piece.y);
		if (e) {
			return e;
		}
	}
	return undefined;
};
var getExitOverride = function (roomId, x, y) {
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		var e = originalGetExit(roomId, x + piece.x, y + piece.y);
		if (e) {
			return e;
		}
	}
	return undefined;
};
before('movePlayer', function () {
	if (enabled) {
		bitsy.getItemIndex = getItemIndexOverride;
		bitsy.getEnding = getEndingOverride;
		bitsy.getExit = getExitOverride;
	}
});
after('movePlayer', function () {
	bitsy.getItemIndex = originalGetItemIndex;
	bitsy.getEnding = originalGetEnding;
	bitsy.getExit = originalGetExit;
	if (enabled) {
		syncPieces();
	}
});

// handle wall/sprite collision
function repeat(fn) {
	var p = bitsy.player();
	var x = p.x;
	var y = p.y;
	var r;
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		p.x = x + piece.x;
		p.y = y + piece.y;
		r = r || fn();
	}
	p.x = x;
	p.y = y;
	return r;
}
var repeats = ['getSpriteLeft', 'getSpriteRight', 'getSpriteUp', 'getSpriteDown', 'isWallLeft', 'isWallRight', 'isWallUp', 'isWallDown'];

// prevent player from colliding with their own pieces
function filterPieces(id) {
	for (var i = 0; i < pieces.length; ++i) {
		if (id === pieces[i].spr || (bitsy.sprite[id] && bitsy.sprite[id].name === pieces[i].spr)) {
			return null;
		}
	}
	return id;
}

// always redraw the full room when sprites are moving
before('drawRoom', function (room, args) {
	args.redrawAll = true;
	return [room, args];
});

after('startExportedGame', function () {
	for (var i = 0; i < repeats.length; ++i) {
		var r = repeats[i];
		var originalFn = bitsy[r];
		// eslint-disable-next-line no-loop-func
		bitsy[r] = function (fn) {
			return enabled ? repeat(fn) : fn();
		}.bind(undefined, originalFn);
	}
	var originalGetSpriteAt = bitsy.getSpriteAt;
	bitsy.getSpriteAt = function () {
		return filterPieces(originalGetSpriteAt.apply(this, arguments));
	};
});

addDualDialogTag('enableBig', function (environment, parameters) {
	enableBig(
		parameters.length
			? parameters.map(function (param) {
					var props = param.split(/,\s*/);
					return { x: parseInt(props[0], 10), y: parseInt(props[1], 10), spr: props[2] };
				})
			: undefined
	);
});
addDualDialogTag('disableBig', function (environment, parameters) {
	disableBig();
});

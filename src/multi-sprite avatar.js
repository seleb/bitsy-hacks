/**
👨‍👨‍👧‍👧
@file multi-sprite avatar
@summary make the player big
@license MIT
@version auto
@requires 8.0
@author Sean S. LeBlanc

@description
Allows multiple sprites to be moved together along with the player
to create the illusion of a larger avatar.

Provided example is a 2x2 square for simplicity,
but multi-sprite avatar's shape can be arbitrary.

Notes:
- will probably break any other hacks involving moving other sprites around (they'll probably use the player's modified collision)
- the original avatar sprite isn't changed, and will covered a piece at x:0,y:0
- make sure not to include the original avatar sprite in the pieces list (this will cause the syncing to remove the player from the game)

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit `pieces` below to customize the multi-sprite avatar
	Pieces must have an x,y offset and a tile id
*/
import bitsy from 'bitsy';
import {
	before,
	after,
} from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	pieces: [{
		x: 0,
		y: 0,
		til: 'c',
	}, {
		x: 1,
		y: 0,
		til: 'd',
	}, {
		x: 0,
		y: 1,
		til: 'e',
	}, {
		x: 1,
		y: 1,
		til: 'f',
	}],
	enabledOnStart: true,
};

if (hackOptions.enabledOnStart) {
	after('onready', enableBig);
}

var enabled = false;
var pieces = [];
var instances = [];

function syncPieces() {
	var p = bitsy.player();
	for (var i = 0; i < instances.length; ++i) {
		instances[i].x = p.x + pieces[i].x;
		instances[i].y = p.y + pieces[i].y;
	}
}

function enableBig(newPieces) {
	disableBig();
	pieces = newPieces || hackOptions.pieces;
	instances = pieces.map(function (piece) {
		var instanceId = ['msa', piece.til, piece.x, piece.y].join('-');
		var instance = bitsy.createSpriteInstance(instanceId, { id: piece.til, x: 0, y: 0 });
		bitsy.spriteInstances[instanceId] = instance;
		return instance;
	});
	enabled = true;
	syncPieces();
}

function disableBig() {
	enabled = false;
	instances.forEach(function (instance) {
		delete bitsy.spriteInstances[instance];
	});
	instances = [];
}

// handle item/ending/exit collision
var originalGetItemId = bitsy.getItemId;
var originalGetEnding = bitsy.getEnding;
var originalGetExit = bitsy.getExit;
var getItemIdOverride = function (roomId, x, y) {
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		var id = originalGetItemId(roomId, x + piece.x, y + piece.y);
		if (id !== null) {
			return id;
		}
	}
	return null;
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
		bitsy.getItemId = getItemIdOverride;
		bitsy.getEnding = getEndingOverride;
		bitsy.getExit = getExitOverride;
	}
});
after('movePlayer', function () {
	bitsy.getItemId = originalGetItemId;
	bitsy.getEnding = originalGetEnding;
	bitsy.getExit = originalGetExit;
	if (enabled) {
		syncPieces();
	}
});

// prevent player from colliding with their own pieces
function filterPieces(instance) {
	return instance.some(function (i) {
		return i === instance;
	});
}

after('startExportedGame', function () {
	var originalGetAllSpritesAt = bitsy.getAllSpritesAt;
	bitsy.getAllSpritesAt = function () {
		return filterPieces(originalGetAllSpritesAt.apply(this, arguments));
	};
});

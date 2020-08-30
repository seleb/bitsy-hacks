/**
💃
@file sprite effects
@summary like text effects, but for sprites
@license MIT
@version auto
@requires 7.1
@author Sean S. LeBlanc

@description
Adds support for applying effects to sprites, items, and tiles.

Usage:
	{spriteEffect "SPR,A,wvy"}
	{spriteEffectNow "TIL,a,shk"}

To disable a text effect, call the dialog command again with the same parameters.

Note that if a name is used instead of an id,
only the first tile with that name is affected.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `hackOptions` object at the top of the script with your custom effects

EFFECT NOTES:
Each effect looks like:
	key: function(pos, time, context) {
		...
	}

The key is the name of the effect, used in the dialog command to apply it.

The function is called every frame before rendering the images it is applied to.
The function arguments are:
	pos:     has the properties `x` and `y`; can be used to modify rendered position
	time:    the current time in milliseconds; can be used to animate effects over time
	context: the 2D canvas rendering context; can be used for various advanced effects
	         (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
*/
import bitsy from 'bitsy';
import { addDualDialogTag, after, before } from './helpers/kitsy-script-toolkit';
import { getImage } from './helpers/utils';

export var hackOptions = {
	// map of custom effects
	effects: {
		wvy: function (pos, time) {
			// sample effect based on bitsy's {wvy} text
			pos.y += (Math.sin(time / 250 - pos.x / 2) * 4) / bitsy.mapsize;
		},
		shk: function (pos, time) {
			// sample effect based on bitsy's {shk} text
			function disturb(func, offset, mult1, mult2) {
				return func(time * mult1 - offset * mult2);
			}
			var y = (3 / bitsy.mapsize) * disturb(Math.sin, pos.x, 0.1, 0.5) * disturb(Math.cos, pos.x, 0.3, 0.2) * disturb(Math.sin, pos.y, 2.0, 1.0);
			var x = (3 / bitsy.mapsize) * disturb(Math.cos, pos.y, 0.1, 1.0) * disturb(Math.sin, pos.x, 3.0, 0.7) * disturb(Math.cos, pos.x, 0.2, 0.3);
			pos.x += x;
			pos.y += y;
		},
		rbw: function (pos, time, context) {
			// sample effect based on bitsy's {rbw} text
			// note that this uses CSS filters (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter)
			var t = Math.sin(time / 600 - (pos.x + pos.y) / 8);
			context.filter = 'grayscale() sepia() saturate(2) hue-rotate(' + t + 'turn)';
		},
		invert: function (pos, time, context) {
			context.filter = 'invert()';
		},
	},
	// reset function called after drawing a tile
	// this can be used to undo any modifications to the canvas or context
	reset: function (img, context) {
		context.filter = 'none';
	},
};

var activeEffects = {
	tile: {},
	sprite: {},
	item: {},
};

// create a map of the images to be rendered for reference
// note: this is being done after `drawRoom` to avoid interfering
// with transparent sprites, which needs to pre-process first
var tileMap = {
	tile: {},
	sprite: {},
	item: {},
};
function buildMap(map, room) {
	var m = tileMap[map];
	Object.keys(activeEffects[map]).forEach(function (id) {
		var tile = bitsy[map][id];
		if (!tile) {
			return;
		}
		var t = (m[id] = m[id] || {});
		var p = (t[room.pal] = t[room.pal] || {});
		new Array(tile.animation.frameCount).fill(0).forEach(function (_, frame) {
			p[frame] = bitsy.getTileImage(tile, room.pal, frame);
		});
	});
}
after('drawRoom', function (room) {
	buildMap('tile', room);
	buildMap('sprite', room);
	buildMap('item', room);
});

// apply effects before rendering tiles
function preprocess(map, img, x, y, context) {
	var m = tileMap[map];
	var foundEffects = Object.entries(activeEffects[map]).find(function (entry) {
		var t = m && m[entry[0]];
		var p = t && t[bitsy.room[bitsy.curRoom].pal];
		return (
			p
			&& Object.values(p).some(function (frame) {
				return frame === img;
			})
		);
	});
	var effects = foundEffects ? foundEffects[1] : [];

	var totalPos = { x: Number(x), y: Number(y) };
	Object.keys(effects).forEach(function (effect) {
		var pos = { x: totalPos.x, y: totalPos.y };
		hackOptions.effects[effect](pos, Date.now(), context);
		totalPos = pos;
	});
	return [img, totalPos.x.toString(), totalPos.y.toString(), context];
}
before('drawTile', function (img, x, y, context) {
	return preprocess('tile', img, x, y, context);
});
before('drawSprite', function (img, x, y, context) {
	return preprocess('sprite', img, x, y, context);
});
before('drawItem', function (img, x, y, context) {
	return preprocess('item', img, x, y, context);
});

// reset after having drawn a tile
after('drawTile', function (img, x, y, context) {
	hackOptions.reset(img, context);
});

// setup dialog commands
var mapMap = {
	spr: 'sprite',
	sprite: 'sprite',
	itm: 'item',
	item: 'item',
	til: 'tile',
	tile: 'tile',
};
addDualDialogTag('spriteEffect', function (environment, parameters) {
	var params = parameters[0].split(/,\s?/);
	var map = mapMap[(params[0] || '').toLowerCase()];
	var id = getImage(params[1] || '', bitsy[map]).id;
	var effect = params[2] || '';
	if (!hackOptions.effects[effect]) {
		throw new Error('Tried to use sprite effect "' + effect + '", but it does not exist');
	}
	var tile = (activeEffects[map][id] = activeEffects[map][id] || {});
	if (tile && tile[effect]) {
		delete tile[effect];
	} else {
		tile[effect] = true;
	}
});

// reset
after('reset_cur_game', function () {
	activeEffects = {
		tile: {},
		sprite: {},
		item: {},
	};
	tileMap = {
		tile: {},
		sprite: {},
		item: {},
	};
});

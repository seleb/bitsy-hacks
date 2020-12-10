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
	{spriteEffect "A" "wvy"}
	{spriteEffectNow "A" "shk"}

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
import { getImage, inject } from './helpers/utils';

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
	reset: function (context) {
		context.filter = 'none';
	},
};

var activeEffects = {};

// apply effects before rendering tiles
function preprocess() {
	var tile = window.spriteEffectsTile;
	var effects = activeEffects[tile.drawing.id] || [];
	var totalPos = { x: Number(tile.x), y: Number(tile.y) };
	effects.forEach(function (effect) {
		var pos = { x: totalPos.x, y: totalPos.y };
		hackOptions.effects[effect](pos, Date.now(), bitsy.context);
		totalPos = pos;
	});
	return [totalPos.x.toString(), totalPos.y.toString()];
}

inject(/(renderTarget\.DrawTile\(id, j, i, renderOptions\);)/, 'window.spriteEffectsTile = { drawing: tile[id], x: j, y: i };\n$1');
inject(/(renderTarget\.DrawSprite\(spriteInstances\[id\], j, i, renderOptions\);)/, 'window.spriteEffectsTile = { drawing: spriteInstances[id], x: j, y: i };\n$1');
inject(/(renderTarget\.DrawSprite\(tile\[id\], j, i, renderOptions\);)/, 'window.spriteEffectsTile = { drawing: tile[id], x: j, y: i };\n$1');

before('bitsyCanvasPutTexture', function (textureId, x, y) {
	if (!window.spriteEffectsTile) {
		return [textureId, x, y];
	}
	var mx = x / window.spriteEffectsTile.x;
	var my = y / window.spriteEffectsTile.y;
	var processed = preprocess();
	return [textureId, processed[0] * mx, processed[1] * my];
});

// reset after having drawn a tile
after('bitsyCanvasPutTexture', function () {
	hackOptions.reset(bitsy.context);
	window.spriteEffectsTile = undefined;
});

// setup dialog commands
addDualDialogTag('spriteEffect', function (parameters) {
	var id = (getImage(parameters[0]) || {}).id;
	var effect = parameters[1];
	if (!id || !effect) {
		throw new Error('Tried to use sprite effect, but missing id or effect');
	}
	if (!hackOptions.effects[effect]) {
		throw new Error('Tried to use sprite effect "' + effect + '", but it does not exist');
	}
	var effects = activeEffects[id] || [];
	activeEffects[id] = effects.filter(function (i) { return i !== effect; });
	if (effects.length === activeEffects[id].length) {
		activeEffects[id].push(effect);
	}
});

// reset
before('reset_cur_game', function () {
	activeEffects = {};
});

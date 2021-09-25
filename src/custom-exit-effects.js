/**
🎞
@file custom-exit-effects
@summary make custom exit transition effects
@license MIT
@author Sean S. LeBlanc

@description
Adds support for custom exit transition effects.
Multiple effects can be added this way.
This can be combined with exit-from-dialog for custom dialog transitions too.

Effects are limited to a relatively low framerate,
and note that the way bitsy renders transitions is fairly inefficient;
for fancier effects it may be better to try the GL transitions hack.

EFFECT NOTES:
Each effect looks like:
	key: {
		showPlayerStart: <true or false>,
		showPlayerEnd: <true or false>,
		stepCount: <number (how long/granular the transition is; built-in effects are all 6, 8, or 12)>
		pixelEffectFunc: function(start, end, pixelX, pixelY, delta) {
			...
		},
		paletteEffectFunc: function(start, end, delta) {
			...
		},
	}

To use the custom effects, you'll need to modify your exit in the gamedata, e.g.
	EXT 1,1 0 13,13
would become
	EXT 1,1 0 13,13 FX key

A single example effect is included, but more can be found in the original effect source by looking for `RegisterTransitionEffect`.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `hackOptions` object at the top of the script with your custom effects
*/
import bitsy from 'bitsy';
import { before } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	// a simple crossfade example effect
	'my-effect': {
		showPlayerStart: true,
		showPlayerEnd: true,
		stepCount: 8,
		pixelEffectFunc: function (start, end, pixelX, pixelY, delta) {
			return (delta > 0.5 ? end : start).GetPixel(pixelX, pixelY);
		},
		paletteEffectFunc: function (start, end, delta) {
			return lerpPalettes(start.Palette, end.Palette, delta);
		},
	},
};

function lerpColor(colorA, colorB, t) {
	return [colorA[0] + (colorB[0] - colorA[0]) * t, colorA[1] + (colorB[1] - colorA[1]) * t, colorA[2] + (colorB[2] - colorA[2]) * t];
}
function lerpPalettes(start, end, delta) {
	var colors = [];

	var maxLength = start.Palette.length > end.Palette.length ? start.Palette.length : end.Palette.length;

	for (var i = 0; i < maxLength; i++) {
		if (i < start.Palette.length && i < end.Palette.length) {
			colors.push(lerpColor(start.Palette[i], end.Palette[i], delta));
		} else if (i < start.Palette.length) {
			colors.push(lerpColor(start.Palette[i], end.Palette[end.Palette.length - 1], delta));
		} else if (i < end.Palette.length) {
			colors.push(lerpColor(start.Palette[start.Palette.length - 1], end.Palette[i], delta));
		}
	}

	return colors;
}

before('startExportedGame', function () {
	// recreate the transition manager so the injected code is used
	bitsy.transition = new bitsy.TransitionManager();
	// make the custom effects available
	Object.entries(hackOptions).forEach(function (entry) {
		bitsy.transition.RegisterTransitionEffect(entry[0], entry[1]);
	});
});

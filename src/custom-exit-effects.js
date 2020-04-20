/**
🎞
@file custom-exit-effects
@summary make custom exit transition effects
@license MIT
@version 1.1.2
@requires 6.0
@author Sean S. LeBlanc

@description
Adds support for custom exit transition effects.
Multiple effects can be added this way.
This can be combined with exit-from-dialog for custom dialog transitions too.

Effects are limited to a relatively low framerate by default.
You can increase the framerate to make it smoother,
but note that the way bitsy renders transitions is fairly inefficient;
for fancier effects it may be better to try the GL transitions hack.

EFFECT NOTES:
Each effect looks like:
	key: {
		showPlayerStart: <true or false>,
		showPlayerEnd: <true or false>,
		duration: <duration in ms>,
		frameRate: <1-60 (default is 8)>
		pixelEffectFunc: function(start, end, pixelX, pixelY, delta) {
			...
		}
	}

To use the custom effects, you'll need to modify your exit in the gamedata, e.g.
	EXT 1,1 0 13,13
would become
	EXT 1,1 0 13,13 FX key

Manipulating pixel data inside the pixel effect function directly is relatively complex,
but bitsy provides a number of helpers that are used to simplify its own effects.
A quick reference guide:
	- start.Image.GetPixel(x,y)
		returns the pixel for a given position at the start of the transition
	- end.Image.GetPixel(x,y)
		returns the pixel for a given position at the end of the transition
	- bitsy.PostProcessUtilities.GetCorrespondingColorFromPal(color,start.Palette,end.Palette)
		converts a pixel from one palette to the other
	- bitsy.PostProcessUtilities.LerpColor(colorA, colorB, delta)
		returns an interpolated pixel

A single example effect is included, but more can be found in the original effect source by looking for `RegisterTransitionEffect`.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `hackOptions` object at the top of the script with your custom effects
*/
import bitsy from 'bitsy';
import {
	before,
	inject,
} from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	// a simple crossfade example effect
	'my-effect': {
		showPlayerStart: true,
		showPlayerEnd: true,
		duration: 500,
		frameRate: 8,
		pixelEffectFunc: function (start, end, pixelX, pixelY, delta) {
			var a = start.Image.GetPixel(pixelX, pixelY);
			var b = end.Image.GetPixel(pixelX, pixelY);
			return bitsy.PostProcessUtilities.LerpColor(a, b, delta);
		},
	},
};

// allow customizable frameRate
inject(/(var maxStep = Math\.floor\()(frameRate \* \(transitionEffects\[curEffect\]\.duration \/ 1000\)\);)/, '$1transitionEffects[curEffect].frameRate || $2');

before('startExportedGame', function () {
	// recreate the transition manager so the injected code is used
	bitsy.transition = new bitsy.TransitionManager();
	// make the custom effects available
	Object.entries(hackOptions).forEach(function (entry) {
		bitsy.transition.RegisterTransitionEffect(entry[0], entry[1]);
	});
});

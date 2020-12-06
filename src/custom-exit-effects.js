/**
🎞
@file custom-exit-effects
@summary make custom exit transition effects
@license MIT
@version auto
@requires 8.0
@author Sean S. LeBlanc

@description
Adds support for custom exit transition effects.
Multiple effects can be added this way.

Effects are limited to a relatively low framerate by default.
You can increase the framerate to make it smoother,
but note that the way bitsy renders transitions is fairly inefficient;
for fancier effects it may be better to try the GL transitions hack.

TODO: documentation of effect properties

Example effects can be found in the bitsy source by looking for `RegisterTransitionEffect`.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `hackOptions` object at the top of the script with your custom effects
*/
import bitsy from 'bitsy';
import { after, inject } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	'my-effect': {
		showPlayerStart: true,
		showPlayerEnd: true,
		duration: 500,
		frameRate: 8,
		onStep: function (start, end, delta) {},
		pixelEffectFunc: function (start, end, pixelX, pixelY, delta) {},
	},
};

// allow customizable frameRate
inject(/(var maxStep = Math\.floor\()(frameRate \* \(curEffect\.duration \/ 1000\)\);)/, '$1curEffect.frameRate || $2');

after('startExportedGame', function () {
	// recreate the transition manager so the injected code is used
	bitsy.transition = new bitsy.TransitionManager();
	// make the custom effects available
	Object.entries(hackOptions).forEach(function (entry) {
		bitsy.transition.RegisterTransitionEffect(entry[0], entry[1]);
	});
});

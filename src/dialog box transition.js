/**
🔁
@file dialog box transition
@summary adds an easing transition animation to display the dialog box text
@license MIT
@author Delacannon

@description
A hack that adds an easing transition animation to display the dialog box text

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source.
*/

import bitsy from 'bitsy';
import { after, before } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	// easing function applied to the transition
	// the provided parameter is the time in 0-1,
	// and the expected return value is a value in 0-1
	// that indicates how much to lerp between the
	// screen edge and the final position
	//
	// the default is a quadratic ease out,
	// see https://gist.github.com/gre/1650294 for more examples
	ease: function (t) {
		return t * (2 - t);
	},
	// how long the transition lasts
	duration: 500,
};

function lerp(from, to, by) {
	return from + (to - from) * by;
}

var start;
var height = 0;

// always redraw the full room when sprites are moving
before('drawRoom', function (room, args) {
	args.redrawAll = true;
	return [room, args];
});

var edge = 0;
before('bitsy.textbox', function (visible, x, y, w, h) {
	height = h || height;
	edge = y < bitsy.height / 2 ? -height : bitsy.height;
});
before('bitsy._graphics.drawImage', function (id, x, y) {
	if (id !== bitsy.bitsy.TEXTBOX) return undefined;
	if (!start) {
		start = bitsy.prevTime;
	}
	return [id, x, lerp(edge, y, hackOptions.ease(Math.min(Math.max(0, (bitsy.prevTime - start) / hackOptions.duration), 1)))];
});
after('onExitDialog', function () {
	start = undefined;
});

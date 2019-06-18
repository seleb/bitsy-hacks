/**
🏃
@file smooth moves
@summary ease the player's movement
@license MIT
@version 1.0.0
@requires Bitsy Version: 6.3
@author Sean S. LeBlanc

@description
Makes the player avatar ease in between positions instead of moving immediately.
Speed and easing function are configurable.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
import {
	before,
	after,
} from "./helpers/kitsy-script-toolkit";
import bitsy from 'bitsy';

export var hackOptions = {
	// duration of ease in ms
	duration: 100,
	// easing function
	ease: function(t) {
		t = 1 - Math.pow(1 - t, 2);
		return t;
	},
};

// smooth move
var fromX;
var fromY;
var toX;
var toY;
var lastMove;
before('movePlayer', function () {
	if (toX) {
		bitsy.player().x = toX;
		bitsy.player().y = toY;
	}
	fromX = bitsy.player().x;
	fromY = bitsy.player().y;
});
after('movePlayer', function () {
	toX = bitsy.player().x;
	toY = bitsy.player().y;
	lastMove = bitsy.prevTime;
});
before('drawRoom', function () {
	if (toX) {
		var t = Math.min(1, (bitsy.prevTime - lastMove) / hackOptions.duration);
		bitsy.player().x = fromX + (toX - fromX) * hackOptions.ease(t);
		bitsy.player().y = fromY + (toY - fromY) * hackOptions.ease(t);
	}
});

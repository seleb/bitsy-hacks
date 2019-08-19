/**
🏃
@file smooth moves
@summary ease the player's movement
@license MIT
@version 1.0.3
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
var dir;
var lastMove;
before('onready', function() {
	fromX = toX = bitsy.player().x;
	fromY = toY = bitsy.player().y;
	lastMove = bitsy.prevTime;
});
before('movePlayer', function () {
	bitsy.player().x = toX;
	bitsy.player().y = toY;
	fromX = bitsy.player().x;
	fromY = bitsy.player().y;
});
after('movePlayer', function () {
	dir = bitsy.curPlayerDirection;
	toX = bitsy.player().x;
	toY = bitsy.player().y;
	lastMove = bitsy.prevTime;
});
var px;
var py;
after('update', function() {
	px = bitsy.player().x;
	py = bitsy.player().y;
});
before('drawRoom', function () {
	if (bitsy.player().x !== px || bitsy.player().y !== py) {
		if (bitsy.player().x % 1 === 0 && bitsy.player().y % 1 === 0) {
			toX = bitsy.player().x;
			toY = bitsy.player().y;
		}
	}
	var t = Math.min(1, (bitsy.prevTime - lastMove) / hackOptions.duration);
	var dx = 0;
	var dy = 0;
	if (Math.abs(toX - fromX) > 0) {
		if(dir === bitsy.Direction.Left) {
			dx -= 1;
		}
		if(dir === bitsy.Direction.Right) {
			dx += 1;
		}
	}
	if (Math.abs(toY - fromY) > 0) {
		if(dir === bitsy.Direction.Up) {
			dy -= 1;
		}
		if(dir === bitsy.Direction.Down) {
			dy += 1;
		}
	}
	bitsy.player().x = toX - Math.sign(dx) * (1.0 - hackOptions.ease(t));
	bitsy.player().y = toY - Math.sign(dy) * (1.0 - hackOptions.ease(t));
});

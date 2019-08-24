/**
🏃
@file smooth moves
@summary ease the player's movement
@license MIT
@version 2.0.0
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
	// max distance to allow tweens
	delta: 1.5,
	// easing function
	ease: function(t) {
		t = 1 - Math.pow(1 - t, 2);
		return t;
	},
};

// smooth move
var tweens = {};
var sprites = {};
function addTween(spr, fromX, fromY, toX, toY) {
	if (Math.abs(toX - fromX) + Math.abs(toY - fromY) > hackOptions.delta) {
		delete tweens[spr];
	} else {
		var t = tweens[spr] = tweens[spr] || {};
		t.fromX = fromX;
		t.fromY = fromY;
		t.toX = toX;
		t.toY = toY;
		t.start = bitsy.prevTime;
	}
}
before('onready', function() {
	tweens = {};
	sprites = {};
});

// listen for changes in sprite positions to add tweens
before('update', function() {
	Object.values(bitsy.sprite).forEach(spr => {
		if (spr.room === bitsy.curRoom) {
			var s = sprites[spr.id] = sprites[spr.id] || {};
			s.x = spr.x;
			s.y = spr.y;
		} else {
			delete sprites[spr.id];
		}
	});
});
function addTweens() {
	Object.entries(sprites).forEach(function (entry) {
		var spr = bitsy.sprite[entry[0]];
		var pos = entry[1];
		if (pos.x !== spr.x || pos.y !== spr.y) {
			addTween(spr.id, pos.x, pos.y, spr.x, spr.y);
		}
	});
}
after('updateInput', addTweens);
after('update', addTweens);
// before drawing, update sprite positions to tweened values
before('drawRoom', function () {
	Object.entries(tweens).forEach(function (entry) {
		var tween = entry[1];
		var t = hackOptions.ease(Math.min(1, (bitsy.prevTime - tween.start) / hackOptions.duration));
		var sprite = bitsy.sprite[entry[0]];
		sprite.x = tween.fromX + (tween.toX - tween.fromX) * t;
		sprite.y = tween.fromY + (tween.toY - tween.fromY) * t;
	});
});
// after drawing, update sprite positions back to normal
after('drawRoom', function () {
	Object.entries(tweens).forEach(function (entry) {
		var tween = entry[1];
		var sprite = bitsy.sprite[entry[0]];
		sprite.x = tween.toX;
		sprite.y = tween.toY;
	});
});

/**
↔
@file directional avatar
@summary flips the player's sprite based on directional movement
@license MIT
@author Sean S. LeBlanc

@description
Flips the player's sprite based on directional movement.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit `horizontalFlipAllowed` and `verticalFlipAllowed` below as needed
*/
import bitsy from 'bitsy';
import { getSpriteData, setSpriteData } from './helpers/edit image at runtime';
import { after, before } from './helpers/kitsy-script-toolkit';
import { transformSpriteData } from './helpers/transform-sprite-data';

export var hackOptions = {
	allowed: function () {
		return {
			// If `horizontalFlipAllowed` is true:
			// 	pressing left will make the player's sprite face backwards
			// 	pressing right will make the player's sprite face forwards
			horizontalFlipAllowed: true,
			// If `verticalFlipAllowed` is true:
			// 	pressing down will make the player's sprite upside-down
			// 	pressing up will make the player's sprite right-side up
			verticalFlipAllowed: false,
		};
	},
};

var hflip = false;
var vflip = false;

after('updateInput', function () {
	// determine which directions need flipping
	var allowed = hackOptions.allowed();
	switch (bitsy.curPlayerDirection) {
		case bitsy.Direction.Up:
			vflip = false;
			break;
		case bitsy.Direction.Down:
			vflip = true;
			break;
		case bitsy.Direction.Left:
			hflip = true;
			break;
		case bitsy.Direction.Right:
			hflip = false;
			break;
		default:
			break;
	}
	vflip = vflip && allowed.verticalFlipAllowed;
	hflip = hflip && allowed.horizontalFlipAllowed;
});
before('drawRoom', function () {
	for (var i = 0; i < bitsy.player().animation.frameCount; ++i) {
		setSpriteData(bitsy.playerId, i, transformSpriteData(getSpriteData(bitsy.playerId, i), vflip, hflip));
	}
});
after('drawRoom', function () {
	for (var i = 0; i < bitsy.player().animation.frameCount; ++i) {
		setSpriteData(bitsy.playerId, i, transformSpriteData(getSpriteData(bitsy.playerId, i), vflip, hflip));
	}
});

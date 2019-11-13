/**
↔
@file directional avatar
@summary flips the player's sprite based on directional movement
@license MIT
@version 1.1.7
@requires 5.3
@author Sean S. LeBlanc

@description
Flips the player's sprite based on directional movement.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit `horizontalFlipAllowed` and `verticalFlipAllowed` below as needed
*/
import bitsy from 'bitsy';
import {
	after,
} from './helpers/kitsy-script-toolkit';
import {
	transformSpriteData,
} from './helpers/transform-sprite-data';
import {
	getSpriteData,
	setSpriteData,
} from './helpers/edit image at runtime';

export var hackOptions = {
	// If `horizontalFlipAllowed` is true:
	// 	pressing left will make the player's sprite face backwards
	// 	pressing right will make the player's sprite face forwards
	horizontalFlipAllowed: true,
	// If `verticalFlipAllowed` is true:
	// 	pressing down will make the player's sprite upside-down
	// 	pressing up will make the player's sprite right-side up
	verticalFlipAllowed: false,
};

var hflip = false;
var vflip = false;
var originalAnimation;

after('updateInput', function () {
	var i;
	// save the original frames
	if (!originalAnimation || originalAnimation.referenceFrame !== getSpriteData(bitsy.playerId, 0)) {
		originalAnimation = {
			frames: [],
		};
		for (i = 0; i < bitsy.player().animation.frameCount; ++i) {
			originalAnimation.frames.push(getSpriteData(bitsy.playerId, i));
		}
	}

	// determine which directions need flipping
	switch (bitsy.curPlayerDirection) {
	case bitsy.Direction.Up:
		vflip = false;
		break;
	case bitsy.Direction.Down:
		vflip = hackOptions.verticalFlipAllowed;
		break;
	case bitsy.Direction.Left:
		hflip = hackOptions.horizontalFlipAllowed;
		break;
	case bitsy.Direction.Right:
		hflip = false;
		break;
	default:
		break;
	}

	// update sprite with flipped frames
	for (i = 0; i < originalAnimation.frames.length; ++i) {
		setSpriteData(bitsy.playerId, i, transformSpriteData(originalAnimation.frames[i], vflip, hflip));
	}
	originalAnimation.referenceFrame = getSpriteData(bitsy.playerId, 0);
});

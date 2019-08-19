/**
↔
@file directional avatar
@summary flips the player's sprite based on directional movement
@license MIT
@version 1.1.6
@requires 5.3
@author Sean S. LeBlanc

@description
Flips the player's sprite based on directional movement.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit `horizontalFlipAllowed` and `verticalFlipAllowed` below as needed
*/
import bitsy from "bitsy";
import {
	after
} from "./helpers/kitsy-script-toolkit";
import {
	getSpriteData,
	setSpriteData
} from "./helpers/edit image at runtime";

export var hackOptions = {
	// If `horizontalFlipAllowed` is true:
	// 	pressing left will make the player's sprite face backwards
	// 	pressing right will make the player's sprite face forwards
	horizontalFlipAllowed: true,
	// If `verticalFlipAllowed` is true:
	// 	pressing down will make the player's sprite upside-down
	// 	pressing up will make the player's sprite right-side up
	verticalFlipAllowed: false
};

// helper function to flip sprite data
function flip(spriteData, v, h) {
	var x, y, x2, y2, col, tmp;
	var s = spriteData.slice();
	if (v && hackOptions.verticalFlipAllowed) {
		for (y = 0; y < s.length / 2; ++y) {
			y2 = s.length - y - 1;
			tmp = s[y];
			s[y] = s[y2];
			s[y2] = tmp;
		}
	}
	if (h && hackOptions.horizontalFlipAllowed) {
		for (y = 0; y < s.length; ++y) {
			col = s[y] = s[y].slice();
			for (x = 0; x < col.length / 2; ++x) {
				x2 = col.length - x - 1;
				tmp = col[x];
				col[x] = col[x2];
				col[x2] = tmp;
			}
		}
	}
	return s;
}

var hflip = false;
var vflip = false;
var originalAnimation;

after('updateInput', function () {
	var i;
	// save the original frames
	if (!originalAnimation || originalAnimation.referenceFrame !== getSpriteData(bitsy.playerId, 0)) {
		originalAnimation = {
			frames: []
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

	// update sprite with flipped frames
	for (i = 0; i < originalAnimation.frames.length; ++i) {
		setSpriteData(bitsy.playerId, i, flip(originalAnimation.frames[i], vflip, hflip));
	}
	originalAnimation.referenceFrame = getSpriteData(bitsy.playerId, 0);
});

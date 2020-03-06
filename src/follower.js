/**
💕
@file follower
@summary makes a single sprite follow the player
@license MIT
@version 2.2.0
@author Sean S. LeBlanc

@description
Makes a single sprite follow the player.
The follower can optionally collide with the player,
and can be changed at runtime with dialog commands.

Usage:
	(follower "followerNameOrId")
	(followerNow "followerNameOrId")
	(followerCollision "true/false")
	(followerDelay "frames")
	(followerDelayNow "frames")

Examples:
	(follower "a") - the sprite with the id "a" starts following
	(follower "my follower") - the sprite with the name "my follower" starts following
	(follower) - stops a current follower
	(followerCollision "true") - enables follower collision
	(followerCollision "false") - disables follower collision
	(followerDelay "0") - sets follower to move immediately after player
	(followerDelay "200") - sets follower to move at normal speed
	(followerDelay "1000") - sets follower to move once per second


Known issues:
- Followers will warp to the player on their first movement.
  This can be avoided by placing them next to or on the same tile as the player.
- When collision is enabled, it's possible for the player to get stuck
  between walls and their follower. Make sure to avoid single-tile width
  spaces when using this (or design with that restriction in mind!)

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below to set up an initial follower
3. Use dialog commands as needed
*/
import bitsy from 'bitsy';
import {
	getImage,
} from './helpers/utils';
import {
	after,
	addDualDialogTag,
	addDialogTag,
	before,
} from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	allowFollowerCollision: false, // if true, the player can walk into the follower and talk to them (possible to get stuck this way)
	follower: 'a', // id or name of sprite to be the follower
	delay: 200, // delay between each follower step (0 is immediate, 400 is twice as slow as normal)
};

var follower;

function setFollower(followerName) {
	follower = getImage(followerName, bitsy.sprite);
}

after('startExportedGame', function () {
	setFollower(hackOptions.follower);

	// remove + add player to sprite list to force rendering them on top of follower
	var p = bitsy.sprite[bitsy.playerId];
	delete bitsy.sprite[bitsy.playerId];
	bitsy.sprite[bitsy.playerId] = p;
});

after('onPlayerMoved', function () {
	var step = {
		x: bitsy.player().x,
		y: bitsy.player().y,
	};
	switch (bitsy.curPlayerDirection) {
	case bitsy.Direction.Up:
		step.y += 1;
		break;
	case bitsy.Direction.Down:
		step.y -= 1;
		break;
	case bitsy.Direction.Left:
		step.x += 1;
		break;
	case bitsy.Direction.Right:
		step.x -= 1;
		break;
	default:
		break;
	}
	if (follower) {
		follower.walkingPath.push(step);
	}
});

function filterFollowing(id) {
	return follower === bitsy.sprite[id] ? null : id;
}
// filter follower out of collisions
var originalGetSpriteLeft = bitsy.getSpriteLeft;
bitsy.getSpriteLeft = function () {
	if (!hackOptions.allowFollowerCollision) {
		return filterFollowing(originalGetSpriteLeft());
	}
	return originalGetSpriteLeft();
};
var originalGetSpriteRight = bitsy.getSpriteRight;
bitsy.getSpriteRight = function () {
	if (!hackOptions.allowFollowerCollision) {
		return filterFollowing(originalGetSpriteRight());
	}
	return originalGetSpriteRight();
};
var originalGetSpriteUp = bitsy.getSpriteUp;
bitsy.getSpriteUp = function () {
	if (!hackOptions.allowFollowerCollision) {
		return filterFollowing(originalGetSpriteUp());
	}
	return originalGetSpriteUp();
};
var originalGetSpriteDown = bitsy.getSpriteDown;
bitsy.getSpriteDown = function () {
	if (!hackOptions.allowFollowerCollision) {
		return filterFollowing(originalGetSpriteDown());
	}
	return originalGetSpriteDown();
};

addDualDialogTag('follower', function (environment, parameters) {
	setFollower(parameters[0]);
});
addDialogTag('followerCollision', function (environment, parameters) {
	hackOptions.allowFollowerCollision = parameters[0] !== 'false';
});
addDualDialogTag('followerDelay', function (environment, parameters) {
	hackOptions.delay = parseInt(parameters[0], 10);
});

before('moveSprites', function () {
	bitsy.moveCounter -= bitsy.deltaTime; // cancel out default movement delay
	bitsy.moveCounter += bitsy.deltaTime * (200 / hackOptions.delay); // apply movement delay from options
});

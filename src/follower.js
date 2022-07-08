/**
💕
@file follower
@summary make sprites follow the player
@license MIT
@author Sean S. LeBlanc

@description
Make sprites follow the player.
Followers can optionally collide with the player,
and can be changed at runtime with dialog commands.

Usage:
	(follower "followerNameOrId")
	(followerNow "followerNameOrId")
	(followerCollision "true/false")
	(followerDelay "frames")
	(followerDelayNow "frames")
	(followerSync)
	(followerSyncNow)

Examples:
	(follower "a") - the sprite with the id "a" starts/stops following
	(follower "my follower") - the sprite with the name "my follower" starts/stops following
	(followerCollision "true") - enables follower collision
	(followerCollision "false") - disables follower collision
	(followerDelay "0") - sets follower to move immediately after player
	(followerDelay "200") - sets follower to move at normal speed
	(followerDelay "1000") - sets follower to move once per second
	(followerSync) - moves the follower on top of the player

Known issues:
- Followers will warp to the player on their first movement.
  This can be avoided by placing them next to or on the same tile as the player.
- When collision is enabled, it's possible for the player to get stuck
  between walls and their followers. Make sure to avoid single-tile width
  spaces when using this (or design with that restriction in mind!)

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below to set up initial followers
3. Use dialog commands as needed
*/
import bitsy from 'bitsy';
import { addDialogTag, addDualDialogTag, after, before } from './helpers/kitsy-script-toolkit';
import { getImage } from './helpers/utils';

export var hackOptions = {
	allowFollowerCollision: false, // if true, the player can walk into followers and talk to them (possible to get stuck this way)
	followers: ['a'], // ids or names of sprites to be followers; use [] to start without a follower
	delay: 200, // delay between each follower step (0 is immediate, 400 is twice as slow as normal)
	stack: false, // if true, followers stack on top of each other; otherwise, they will form a chain
};

export var followers = [];
var paths = {};

function setFollower(followerName) {
	var follower = followerName && getImage(followerName, bitsy.sprite);
	if (!follower) {
		throw new Error('Failed to find sprite with id/name "' + followerName + '"');
	}
	var idx = followers.indexOf(follower);
	if (idx >= 0) {
		followers.splice(idx, 1);
	} else {
		followers.push(follower);
	}
	paths[follower.id] = paths[follower.id] || [];
	takeStep();
}

var walking = false;
var shouldWalk = false;

function takeStep() {
	if (walking) {
		return;
	}
	walking = true;
	setTimeout(() => {
		shouldWalk = true;
	}, hackOptions.delay);
}

after('startExportedGame', function () {
	hackOptions.followers.forEach(setFollower);

	// remove + add player to sprite list to force rendering them on top of followers
	var p = bitsy.sprite[bitsy.playerId];
	delete bitsy.sprite[bitsy.playerId];
	bitsy.sprite[bitsy.playerId] = p;
});

let px;
let py;
before('update', function () {
	px = bitsy.player().x;
	py = bitsy.player().y;
});
let movedFollower = false;
after('update', function () {
	if (shouldWalk) {
		shouldWalk = false;
		let takeAnother = false;
		followers.forEach(function (follower) {
			var path = paths[follower.id];
			var point = path.shift();
			if (point) {
				follower.x = point.x;
				follower.y = point.y;
				follower.room = point.room;
			}
			walking = false;
			if (path.length) {
				takeAnother = true;
			}
		});
		if (takeAnother) {
			takeStep();
		}
	}

	// only walk if player moved
	if (px === bitsy.player().x && py === bitsy.player().y) {
		return;
	}
	// skip walking if already moved due to exits
	if (movedFollower) {
		movedFollower = false;
		return;
	}

	if (!followers.length) {
		takeStep();
		walking = false;
		return;
	}

	// start at the player's current position (they have already moved)
	var step = {
		x: bitsy.player().x,
		y: bitsy.player().y,
		room: bitsy.player().room,
	};
	// adjust follower to be one step back
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
	followers.forEach(function (follower, idx) {
		if (idx === 0 || hackOptions.stack) {
			paths[follower.id].push(step);
		} else {
			var prevFollower = followers[idx - 1];
			var prev = paths[prevFollower.id];
			paths[follower.id].push(
				prev[prev.length - 2] || {
					x: prevFollower.x,
					y: prevFollower.y,
					room: prevFollower.room,
				}
			);
		}
	});
	takeStep();
});

// make followers walk "through" exits
before('movePlayerThroughExit', function (exit) {
	if (followers.length) {
		movedFollower = true;
		followers.forEach(function (follower) {
			paths[follower.id].push({
				x: exit.dest.x,
				y: exit.dest.y,
				room: exit.dest.room,
			});
		});
		takeStep();
	}
});

function filterFollowing(id) {
	return followers.some(function (follower) {
		return follower.id === id;
	})
		? null
		: id;
}

var originalGetSpriteLeft;
var originalGetSpriteRight;
var originalGetSpriteUp;
var originalGetSpriteDown;
before('movePlayer', function () {
	originalGetSpriteLeft = bitsy.getSpriteLeft;
	originalGetSpriteRight = bitsy.getSpriteRight;
	originalGetSpriteUp = bitsy.getSpriteUp;
	originalGetSpriteDown = bitsy.getSpriteDown;

	// filter follower out of collisions
	bitsy.getSpriteLeft = function () {
		if (!hackOptions.allowFollowerCollision) {
			return filterFollowing(originalGetSpriteLeft());
		}
		return originalGetSpriteLeft();
	};
	bitsy.getSpriteRight = function () {
		if (!hackOptions.allowFollowerCollision) {
			return filterFollowing(originalGetSpriteRight());
		}
		return originalGetSpriteRight();
	};
	bitsy.getSpriteUp = function () {
		if (!hackOptions.allowFollowerCollision) {
			return filterFollowing(originalGetSpriteUp());
		}
		return originalGetSpriteUp();
	};
	bitsy.getSpriteDown = function () {
		if (!hackOptions.allowFollowerCollision) {
			return filterFollowing(originalGetSpriteDown());
		}
		return originalGetSpriteDown();
	};
});

after('movePlayer', function () {
	bitsy.getSpriteLeft = originalGetSpriteLeft;
	bitsy.getSpriteRight = originalGetSpriteRight;
	bitsy.getSpriteUp = originalGetSpriteUp;
	bitsy.getSpriteDown = originalGetSpriteDown;
});

addDualDialogTag('follower', function (environment, parameters) {
	setFollower(parameters[0]);
});
addDialogTag('followerCollision', function (environment, parameters) {
	hackOptions.allowFollowerCollision = parameters[0] !== 'false';
});
addDualDialogTag('followerDelay', function (environment, parameters) {
	hackOptions.delay = parseInt(parameters[0], 10);
});
addDualDialogTag('followerSync', function () {
	var player = bitsy.player();
	followers.forEach(function (follower) {
		follower.room = player.room;
		follower.x = player.x;
		follower.y = player.y;
		paths[follower.id].length = 0;
	});
});

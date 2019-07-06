/**
💕
@file follower
@summary makes a single sprite follow the player
@license MIT
@version 2.1.2
@author Sean S. LeBlanc

@description
Makes a single sprite follow the player.
Bitsy has a "walkingPath" built into the sprite system (I think this is a hold-over from the old pathfinding mouse controls).
Paths can be assigned to any sprite to create different AI behaviours. 

Includes an optional feature which filters the follower out of collisions.

Known issues:
- if the player uses an exit that puts them on top of another exit, the follower walks through the second exit.
- the follower will warp to the player on the first movement. This can be avoided by placing them next to the player in bitsy.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit `follower` to your intended sprite
*/
import bitsy from "bitsy";
import {
	getImage
} from "./helpers/utils";
import {
	after
} from "./helpers/kitsy-script-toolkit";

export var hackOptions = {
	allowFollowerCollision: false, // if true, the player can walk into the follower and talk to them (possible to get stuck this way)
	follower: 'a' // id or name of sprite to be the follower
};

var follower;
after('startExportedGame', function () {
	follower = getImage(hackOptions.follower, bitsy.sprite);

	// remove + add player to sprite list to force rendering them on top of follower
	var p = bitsy.sprite[bitsy.playerId];
	delete bitsy.sprite[bitsy.playerId];
	bitsy.sprite[bitsy.playerId] = p;

	lastRoom = bitsy.player().room;
});

var lastRoom;
after('onPlayerMoved', function () {
	// detect room change
	if (lastRoom !== bitsy.player().room) {
		// on room change, warp to player
		lastRoom = follower.room = bitsy.player().room;
		follower.x = bitsy.player().x;
		follower.y = bitsy.player().y;
		follower.walkingPath.length = 0;
	} else {
		var step = {
			x: bitsy.player().x,
			y: bitsy.player().y
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
		follower.walkingPath.push(step);
	}
});

function filterFollowing(id) {
	return follower === bitsy.sprite[id] ? null : id;
}
if (!hackOptions.allowFollowerCollision) {
	// filter follower out of collisions
	var _getSpriteLeft = bitsy.getSpriteLeft;
	bitsy.getSpriteLeft = function () {
		return filterFollowing(_getSpriteLeft());
	}
	var _getSpriteRight = bitsy.getSpriteRight;
	bitsy.getSpriteRight = function () {
		return filterFollowing(_getSpriteRight());
	}
	var _getSpriteUp = bitsy.getSpriteUp;
	bitsy.getSpriteUp = function () {
		return filterFollowing(_getSpriteUp());
	}
	var _getSpriteDown = bitsy.getSpriteDown;
	bitsy.getSpriteDown = function () {
		return filterFollowing(_getSpriteDown());
	}
}

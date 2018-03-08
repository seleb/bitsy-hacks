/*
bitsy hack - follower

Makes a single sprite follow the player.
Bitsy has a "walkingPath" built into the sprite system (I think this is a hold-over from the old pathfinding mouse controls).
Paths can be assigned to any sprite to create different AI behaviours. 

Includes an optional feature which filters the follower out of collisions.

Known issues:
- if the player uses an exit that puts them on top of another exit, the follower walks through the second exit.
- the follower will warp to the player on the first movement. This can be avoided by placing them next to the player in bitsy.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit `follower = sprite.a` to your intended sprite
*/
(function () {
'use strict';


var follower;
var allowFollowerCollision = false; // if true, the player can walk into the follower and talk to them (possible to get stuck this way)
var _startExportedGame = startExportedGame;
startExportedGame = function () {
	if (_startExportedGame) {
		_startExportedGame();
	}

	follower = sprite.a;

	// remove + add player to sprite list to force rendering them on top of follower
	var p = sprite[playerId];
	delete sprite[playerId];
	sprite[playerId] = p;

	lastRoom = player().room;
};

var lastRoom;
var _onPlayerMoved = onPlayerMoved;
onPlayerMoved = function () {
	if (_onPlayerMoved) {
		_onPlayerMoved();
	}

	// detect room change
	if (lastRoom !== player().room) {
		// on room change, warp to player
		lastRoom = follower.room = player().room;
		follower.x = player().x;
		follower.y = player().y;
		follower.walkingPath.length = 0;
	} else {
		var step = {
			x: player().x,
			y: player().y
		};
		switch (curPlayerDirection) {
		case Direction.Up:
			step.y += 1;
			break;
		case Direction.Down:
			step.y -= 1;
			break;
		case Direction.Left:
			step.x += 1;
			break;
		case Direction.Right:
			step.x -= 1;
			break;
		default:
			break;
		}
		follower.walkingPath.push(step);
	}
};

if (!allowFollowerCollision) {
	// filter follower out of collisions
	function filterFollowing(id) {
		return follower === sprite[id] ? null : id;
	}
	var _getSpriteLeft = getSpriteLeft;
	getSpriteLeft = function () {
		return filterFollowing(_getSpriteLeft());
	};
	var _getSpriteRight = getSpriteRight;
	getSpriteRight = function () {
		return filterFollowing(_getSpriteRight());
	};
	var _getSpriteUp = getSpriteUp;
	getSpriteUp = function () {
		return filterFollowing(_getSpriteUp());
	};
	var _getSpriteDown = getSpriteDown;
	getSpriteDown = function () {
		return filterFollowing(_getSpriteDown());
	};
}

}());

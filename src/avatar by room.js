/**
👥
@file avatar by room
@summary change the avatar in certain rooms
@license MIT
@version 1.0
@requires 5.3
@author Sean S. LeBlanc

@description
Simple hack for changing avatar to another sprite as you move between rooms.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit hackOptions below to set up the avatar list for rooms you move through.

By default, the avatar will reset to the default if you enter a room without a sprite defined.
This can also be changed in the hackOptions below to instead apply avatar changes permanently.
*/
import bitsy from "bitsy";
import {
	getRoom,
	getImage
} from "./helpers/utils";
import {
	after,
	before
} from "./helpers/kitsy-script-toolkit";

export var hackOptions = {
	permanent: false, // If true, avatar changes will persist across rooms without sprites defined
	// You need to put an entry in this list for every room ID or name that you want to change the avatar,
	// and then specify the sprite ID or name of what to change to. Expand this list to as many rooms as you need.
	avatarByRoom: {
		0: 'sprite ID',
		1: 'A', // note that 'A' is the player sprite, so this does nothing by default, but will reset the player if permanent == true
		2: 'another sprite ID',
		h: 'a sprite ID for a room with a non-numeric ID',
		'my room': 'a sprite ID for a room with a user-defined name'
	},
};

// expand the map to include ids of rooms listed by name
// and store the original player sprite
var originalAvatar;
after('load_game', function () {
	var room;
	for (var i in hackOptions.avatarByRoom) {
		if (hackOptions.avatarByRoom.hasOwnProperty(i)) {
			room = getRoom(i);
			if (room) {
				hackOptions.avatarByRoom[room.id] = hackOptions.avatarByRoom[i];
			}
		}
	}
	originalAvatar = bitsy.player().drw;
});

var currentRoom;
before('update', function () {
	if (bitsy.curRoom !== currentRoom) {
		currentRoom = bitsy.curRoom;
		var newAvatarId = hackOptions.avatarByRoom[currentRoom];
		if (
			(!newAvatarId && !hackOptions.permanent) // if no sprite defined + not permanent, reset
			||
			(newAvatarId === bitsy.playerId) // manual reset
		) {
			bitsy.player().drw = originalAvatar;
			return;
		}
		if (newAvatarId === bitsy.playerId) {
			bitsy.player().drw
		}
		var newAvatar = getImage(newAvatarId, bitsy.sprite);
		if (!newAvatar) {
			throw new Error('Could not find sprite "' + newAvatarId + '" for room "' + currentRoom + '"');
		}
		bitsy.player().drw = newAvatar.drw;
	}
});

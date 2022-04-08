/**
👥
@file avatar by room
@summary change the avatar in certain rooms
@license MIT
@author Sean S. LeBlanc

@description
Simple hack for changing avatar to another sprite as you move between rooms.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit hackOptions below to set up the avatar list for rooms you move through.

By default, the avatar will reset to the default if you enter a room without a sprite defined.
This can also be changed in the hackOptions below to instead apply avatar changes permanently.

Note: This hack is compatible with multi-sprite avatar. In order to use both of them together,
fill out the `avatarByRoom` values using the `pieces` format instead of individual sprites.
*/
import bitsy from 'bitsy';
import { after, before } from './helpers/kitsy-script-toolkit';
import { getImage, getRoom } from './helpers/utils';

export var hackOptions = {
	permanent: false, // If true, avatar changes will persist across rooms without sprites defined
	// You need to put an entry in this list for every room ID or name that you want to change the avatar,
	// and then specify the sprite ID or name of what to change to. Expand this list to as many rooms as you need.
	avatarByRoom: {
		// Note: the entries below are examples that should be removed and replaced with your own room -> sprite mappings
		0: 'sprite ID',
		1: 'A', // note that 'A' is the player sprite, so this does nothing by default, but will reset the player if permanent == true
		2: 'another sprite ID',
		h: 'a sprite ID for a room with a non-numeric ID',
		'my room': 'a sprite ID for a room with a user-defined name',
	},
};

// expand the map to include ids of rooms listed by name
// and store the original player sprite
var originalDrw;
var originalAnimation;
after('load_game', function () {
	var room;
	Object.keys(hackOptions.avatarByRoom).forEach(function (i) {
		room = getRoom(i);
		if (room) {
			hackOptions.avatarByRoom[room.id] = hackOptions.avatarByRoom[i];
		}
	});
	originalDrw = bitsy.player().drw;
	originalAnimation = bitsy.player().animation;
});

function updateAvatar() {
	var player = bitsy.player();
	var newAvatarId = hackOptions.avatarByRoom[currentRoom];
	if (window.hacks && window.hacks['multi-sprite_avatar'] && window.hacks['multi-sprite_avatar'].enableBig) {
		// HACK: support multi-sprite avatar by room
		window.hacks['multi-sprite_avatar'].enableBig(newAvatarId);
	} else {
		if (
			(!newAvatarId && !hackOptions.permanent) || // if no sprite defined + not permanent, reset
			newAvatarId === player.id // manual reset
		) {
			player.drw = originalDrw;
			player.animation = originalAnimation;
			return;
		}
		var newAvatar = getImage(newAvatarId, bitsy.sprite);
		if (!newAvatar) {
			throw new Error('Could not find sprite "' + newAvatarId + '" for room "' + currentRoom + '"');
		}
		player.drw = newAvatar.drw;
		player.animation = Object.assign({}, newAvatar.animation);
	}
}

var currentRoom;
before('drawRoom', function () {
	var player = bitsy.player();
	if (player.room === currentRoom) {
		return;
	}
	currentRoom = player.room;
	updateAvatar(currentRoom);
});

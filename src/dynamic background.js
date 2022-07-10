/**
🖼
@file dynamic background
@summary HTML background matching bitsy background
@license MIT
@author Sean S. LeBlanc

@description
Updates the background of the html body to match the background colour of the bitsy palette.

HOW TO USE:
Copy-paste this script into a script tag after the bitsy source
*/
import bitsy from 'bitsy';
import { after } from './helpers/kitsy-script-toolkit';
import { getRoom } from './helpers/utils';

export var hackOptions = {
	// which palette colour to use for the background
	// 	0 = background
	// 	1 = tile
	// 	2 = sprite
	default: 0,
	// entries here will override the default for the given room
	byRoom: {
		// examples:
		// 0: 2
		// 'my room': 1
	},
};

// helper function which detects when the palette has changed,
// and updates the background to match
function updateBg() {
	// get the palette colour
	var c = hackOptions.byRoom[bitsy.state.room];
	if (c === undefined) {
		c = hackOptions.default;
	}

	// if the palette changed, update background
	var bg = 'rgb(' + bitsy.getPal(bitsy.curPal())[c].join(',') + ')';
	if (document.body.style.background !== bg) {
		document.body.style.background = bg;
	}
}

// expand the map to include ids of rooms listed by name
after('load_game', function () {
	var room;
	Object.keys(hackOptions.byRoom).forEach(function (i) {
		room = getRoom(i);
		if (room) {
			hackOptions.byRoom[room.id] = hackOptions.byRoom[i];
		}
	});
});

// wrap every function which involves changing the palette
after('movePlayer', updateBg);
after('parseWorld', updateBg);
after('movePlayerThroughExit', updateBg);

/**
🚪
@file exit-from-dialog
@summary exit to another room from dialog, including conditionals
@license WTFPL (do WTF you want)
@version 6.1.1
@requires Bitsy Version: 6.0
@author @mildmojo

@description
Lets you exit to another room from dialog (including inside conditionals).
Use it to make an invisible sprite that acts as a conditional exit, use it to warp
somewhere after a conversation, use it to put a guard at your gate who only
lets you in once you're disguised, use it to require payment before the
ferryman will take you across the river.

Using the (exit) function in any part of a series of dialog will make the
game exit to the new room after the dialog is finished. Using (exitNow) will
immediately warp to the new room, but the current dialog will continue.

The (exitHere) and (exitHereNow) functions work the same, except without
the requirement to specify the coordinates, instead using the current
coordinates of the player sprite.

Usage:
	(exit "<room name>,<x>,<y>,<optional transition_effect>")
	(exitNow "<room name>,<x>,<y>,<optional transition_effect>")
	(exitHere "<room name>,<optional transition_effect>")
	(exitHereNow "<room name>,<optional transition_effect>")

Example:
	(exit "FinalRoom,8,4")
	(exit "FinalRoom,8,4,tunnel")
	(exitHere "FinalRoom")
	(exitHere "FinalRoom,tunnel")

HOW TO USE:
1. Copy-paste this script into a new script tag after the Bitsy source code.
   It should appear *before* any other mods that handle loading your game
   data so it executes *after* them (last-in first-out).

NOTE:
This uses parentheses "()" instead of curly braces "{}" around function
calls because the Bitsy editor's fancy dialog window strips unrecognized
curly-brace functions from dialog text. To keep from losing data, write
these function calls with parentheses like the examples above.

For full editor integration, you'd *probably* also need to paste this
code at the end of the editor's `bitsy.js` file. Untested.
*/
import bitsy from "bitsy";
import {
	getRoom
} from "./helpers/utils";
import {
	addDualDialogTag
} from "./helpers/kitsy-script-toolkit";

// Implement the dialog functions
addDualDialogTag('exit', function (environment, parameters) {
	var exit = getExitParams(parameters);
	if (!exit) {
		return;
	}
	bitsy.movePlayerThroughExit(exit);
});

function getExitParams(parameters) {
	var p = bitsy.player();
	var params = parameters[0].split(',');
	var roomName = params[0];
	var x = params[1];
	var y = params[2];
	var transition_effect = params[3];
	var room = getRoom(roomName);

	if (!room) {
		room = bitsy.room[p.room];
	}

	if (!x) {
		x = p.x;
	} else if (x.startsWith('+')) {
		x = p.x + Number(x);
	} else if (x.startsWith('-')) {
		x = p.x - Number(x);
	} else {
		x = Number(x);
	}

	if (!y) {
		y = p.y;
	} else if (y.startsWith('+')) {
		y = p.y + Number(y);
	} else if (y.startsWith('-')) {
		y = p.y - Number(y);
	} else {
		y = Number(y);
	}

	return {
		dest: {
			room: room.id,
			x,
			y,
		},
		transition_effect,
	};
}
// End of (exit) dialog function mod

/**
🚪
@file exit-from-dialog
@summary exit to another room from dialog, including conditionals
@license WTFPL (do WTF you want)
@version 6.0.0
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
	var exit = _getExitParams(parameters);
	if (!exit) {
		return;
	}
	bitsy.movePlayerThroughExit(exit);
});

function _getExitParams(parameters) {
	var params = parameters[0].split(',');
	var roomName = params[0];
	var x = params[1];
	var y = params[2];
	var transition_effect = params[3];
	var room = getRoom(roomName).id;

	if (!roomName || x === undefined || y === undefined) {
		console.warn('{exit/exitNow} was missing parameters! Usage: {exit/exitNow "roomname,x,y"}');
		return null;
	}

	if (room === undefined) {
		console.warn("Bad {exit/exitNow} parameter: Room '" + roomName + "' not found!");
		return null;
	}

	return {
		dest: {
			room,
			x: Number(x),
			y: Number(y),
		},
		transition_effect,
	};
}

addDualDialogTag('exitHere', function (environment, parameters) {
	var exit = _getExitHereParams(parameters);
	if (!exit) {
		return;
	}
	bitsy.movePlayerThroughExit(exit);
});

function _getExitHereParams(parameters) {
	var params = parameters[0].split(',');
	var roomName = params[0];
	var transition_effect = params[1];
	var room = getRoom(roomName).id
	
	var x = bitsy.player().x;
	var y = bitsy.player().y;

	if (!roomName) {
		console.warn('{exitHere/exitHereNow} was missing parameters! Usage: {exitHere/exitHereNow "roomname,transition(optional)"}');
		return null;
	}

	if (room === undefined) {
		console.warn("Bad {exitHere/exitHereNow} parameter: Room '" + roomName + "' not found!");
		return null;
	}

	return {
		dest: {
			room,
			x: Number(x),
			y: Number(y),
		},
		transition_effect,
	};
}
// End of (exit) dialog function mod

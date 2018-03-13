/**
🚪
@file exit-from-dialog
@summary exit to another room from dialog, including conditionals
@license WTFPL (do WTF you want)
@version 3.0.1
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
Lets you exit to another room from dialog (including inside conditionals). Use
it to make an invisible sprite that acts as a conditional exit, use it to warp
somewhere after a conversation, use it to put a guard at your gate who only
lets you in once you're disguised, use it to require payment before the
ferryman will take you across the river.

Using the (exit) function in any part of a series of dialog will make the
game exit to the new room after the dialog is finished. Using (exitNow) will
immediately warp to the new room, but the current dialog will continue.

WARNING: In exit coordinates, the TOP LEFT tile is (0,0). In sprite coordinates,
         the BOTTOM LEFT tile is (0,0). If you'd like to use sprite coordinates,
         add the word "sprite" as the fourth parameter to the exit function.

Usage: (exit "<room name>,<x>,<y>")
       (exit "<room name>,<x>,<y>,sprite")
       (exitNow "<room name>,<x>,<y>")
       (exitNow "<room name>,<x>,<y>,sprite")

Example: (exit "FinalRoom,8,4")
         (exitNow "FinalRoom,8,11,sprite")

HOW TO USE:
  1. Copy-paste this script into a new script tag after the Bitsy source code.
     It should appear *before* any other mods that handle loading your game
     data so it executes *after* them (last-in first-out).

NOTE: This uses parentheses "()" instead of curly braces "{}" around function
      calls because the Bitsy editor's fancy dialog window strips unrecognized
      curly-brace functions from dialog text. To keep from losing data, write
      these function calls with parentheses like the examples above.

      For full editor integration, you'd *probably* also need to paste this
      code at the end of the editor's `bitsy.js` file. Untested.
*/
'use strict';
import bitsy from "bitsy";
import {
	before,
	after,
	inject
} from "./kitsy-script-toolkit.js";

var queuedDialogExit = null;

// Hook into game load and rewrite custom functions in game data to Bitsy format.
before('load_game', function (game_data, startWithTitle) {
	// Rewrite custom functions' parentheses to curly braces for Bitsy's
	// interpreter. Unescape escaped parentheticals, too.
	var fixedGameData = game_data
	.replace(/(^|[^\\])\((exit(Now)? ".+?")\)/g, "$1{$2}") // Rewrite (exit...) to {exit...}
	.replace(/\\\((exit(Now)? ".+")\\?\)/g, "($1)"); // Rewrite \(exit...\) to (exit...)
	return [fixedGameData, startWithTitle];
});

// Hook into the game reset and make sure exit data gets cleared.
after('clearGameData', function () {
	queuedDialogExit = null;
});

// Hook into the dialog finish event; if there was an {exit}, travel there now.
after('onExitDialog', function () {
	if (queuedDialogExit) {
		doPlayerExit(queuedDialogExit);
		queuedDialogExit = null;
	}
});

// Implement the {exit} dialog function. It saves the room name and
// destination X/Y coordinates so we can travel there after the dialog is over.
bitsy.exitFunc = function (environment, parameters, onReturn) {
	queuedDialogExit = _getExitParams('exit', parameters);

	onReturn(null);
}

// Implement the {exitNow} dialog function. It exits to the destination room
// and X/Y coordinates right damn now.
bitsy.exitNowFunc = function (environment, parameters, onReturn) {
	var exitParams = _getExitParams('exitNow', parameters);
	if (!exitParams) {
		return;
	}

	doPlayerExit(exitParams);
	onReturn(null);
}

// Rewrite the Bitsy script tag, making these new functions callable from dialog.
inject(
	'var functionMap = new Map();',
	'functionMap.set("exit", exitFunc);',
	'functionMap.set("exitNow", exitNowFunc);'
);

function _getExitParams(exitFuncName, parameters) {
	var params = parameters[0].split(',');
	var roomName = params[0];
	var x = params[1];
	var y = params[2];
	var coordsType = (params[3] || 'exit').toLowerCase();
	var useSpriteCoords = coordsType === 'sprite';
	var roomId = bitsy.names.room.get(roomName);

	if (!roomName || x === undefined || y === undefined) {
		console.warn('{' + exitFuncName + '} was missing parameters! Usage: {' +
			exitFuncName + ' "roomname,x,y"}');
		return null;
	}

	if (roomId === undefined) {
		console.warn("Bad {" + exitFuncName + "} parameter: Room '" + roomName + "' not found!");
		return null;
	}

	return {
		room: roomId,
		x: Number(x),
		y: useSpriteCoords ? 15 - Number(y) : Number(y)
	};
}

// dest === {room: Room, x: Int, y: Int}
function doPlayerExit(dest) {
	bitsy.player().room = dest.room;
	bitsy.player().x = dest.x;
	bitsy.player().y = dest.y;
	bitsy.curRoom = dest.room;
}
// End of (exit) dialog function mod
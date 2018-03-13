/**
🔚
@file end-from-dialog
@summary trigger an ending from dialog, including narration text
@license WTFPL (do WTF you want)
@version 2.0.0
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
Lets you end the game from dialog (including inside conditionals).

Using the (end) function in any part of a series of dialog will make the
game end after the dialog is finished. Ending the game resets it back to the
intro.

Using (endNow) at the end of a sentence will display the whole sentence and
immediately clear the background. No further dialog from that passage will
display, and the game will reset when you proceed. Using (endNow) with
narration text will immediately exit the dialog, clear the background, and
show the ending narration in an ending-style centered dialog box.

Usage: (end)
       (end "<ending narration>")
       (endNow)
       (endNow "<ending narration>")

Example: (end)
         (end "Five friars bid you goodbye. You leave the temple, hopeful.")
         (endNow "The computer is still online! The chamber floods with neurotoxin.")

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

var queuedEndingNarration = null;

// Hook into game load and rewrite custom functions in game data to Bitsy format.
before('load_game', function (game_data, startWithTitle) {
	// Rewrite custom functions' parentheses to curly braces for Bitsy's
	// interpreter. Unescape escaped parentheticals, too.
	var fixedGameData = game_data
	.replace(/(^|[^\\])\(((end|endNow)( ".+?")?)\)/g, "$1{$2}") // Rewrite (end...) to {end...}
	.replace(/(^|\\)\(((end|endNow)( ".+?")?)\\?\)/g, "($2)"); // Rewrite \(end...\) to (end...)
	return [fixedGameData, startWithTitle];
});

// Hook into the game reset and make sure queued ending data gets cleared.
after('clearGameData', function () {
	queuedEndingNarration = null;
});

// Hook into the dialog finish event; if there was an {end}, start the ending.
after('onExitDialog', function () {
	if (!bitsy.isEnding && queuedEndingNarration) {
		bitsy.startNarrating(queuedEndingNarration === true ? null : queuedEndingNarration, true);
	}
});

// Implement the {end} dialog function. It stores the ending narration, if any,
// and schedules the game to end after the current dialog finishes.
bitsy.endFunc = function (environment, parameters, onReturn) {
	queuedEndingNarration = parameters || true;

	onReturn(null);
}

// Implement the {endNow} dialog function. It starts ending narration, if any,
// and restarts the game right damn now.
bitsy.endNowFunc = function (environment, parameters, onReturn) {
	bitsy.endFunc.call(this, environment, parameters, function () {});
	bitsy.dialogBuffer.EndDialog();
	bitsy.onExitDialog();
}

// Rewrite the Bitsy script tag, making these new functions callable from dialog.
inject(
	'var functionMap = new Map();',
	'functionMap.set("end", endFunc);',
	'functionMap.set("endNow", endNowFunc);'
);
// End of (end) dialog function mod
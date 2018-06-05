/**
🔚
@file end-from-dialog
@summary trigger an ending from dialog, including narration text
@license WTFPL (do WTF you want)
@version 2.0.1
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
	addDialogTag,
	addDeferredDialogTag
} from "./helpers/kitsy-script-toolkit";

// Implement the {end} dialog function. It schedules the game to end after the current dialog finishes.
addDeferredDialogTag('end', function (environment, parameters) {
	bitsy.startNarrating(parameters || null, true);
});

// Implement the {endNow} dialog function. It starts ending narration, if any,
// and restarts the game right damn now.
addDialogTag('endNow', function (environment, parameters, onReturn) {
	onReturn(null);
	bitsy.startNarrating(parameters || null, true);
});
// End of (end) dialog function mod
/**
🚀
@file dialog jump
@summary jump from one dialog entry to another
@license MIT
@version 1.1.2
@requires 5.3
@author Sean S. LeBlanc

@description
This can be used to simplify complex dialog
by moving portions to self-contained dialog entries,
and then jumping to the appropriate id when necessary.

You can also provide raw dialog text instead of an id;
Functionally this isn't much different from writing raw dialog text,
but it has some uses for advanced cases (e.g. when combined with dialog choices)

Usage:
	(jump "dialogId")
	(jumpNow "dialogId")
	(jump "dialog to print")
	(jumpNow "dialog to print")

Note: be careful of infinite loops, e.g.
DLG_infinite_loop
"""
this will print forever(jump "DLG_infinite_loop")
"""

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
Copy-paste into a script tag after the bitsy source
*/
'use strict';
import bitsy from "bitsy";
import {
	addDualDialogTag
} from "./helpers/kitsy-script-toolkit";

// jump function
function jump(targetDialog) {
	if (!targetDialog) {
		console.warn('Tried to jump to dialog, but no target dialog provided');
		return;
	}
	var dialogStr = bitsy.dialog[targetDialog];
	if (!dialogStr) {
		dialogStr = targetDialog;
	}
	bitsy.startDialog(dialogStr);
}

addDualDialogTag('jump', function (environment, parameters) {
	jump(parameters[0]);
});

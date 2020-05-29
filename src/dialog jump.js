/**
🚀
@file dialog jump
@summary jump from one dialog entry to another
@license MIT
@version 2.0.0
@requires 7.0
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

HOW TO USE:
Copy-paste into a script tag after the bitsy source
*/


import bitsy from 'bitsy';
import {
	addDualDialogTag,
} from './helpers/kitsy-script-toolkit';

// jump function
function jump(targetDialog) {
	if (!targetDialog) {
		console.warn('Tried to jump to dialog, but no target dialog provided');
		return;
	}
	var dialogStr = bitsy.dialog[targetDialog];
	var dialogId;
	if (!dialogStr) {
		dialogStr = targetDialog;
	} else {
		dialogId = targetDialog;
		dialogStr = dialogStr.src;
	}
	bitsy.startDialog(dialogStr, dialogId);
}

addDualDialogTag('jump', function (environment, parameters) {
	jump(parameters[0]);
});

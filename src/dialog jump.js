/**
🚀
@file dialog jump
@summary jump from one dialog entry to another
@license MIT
@version auto
@requires 8.0
@author Sean S. LeBlanc

@description
This can be used to simplify complex dialog
by moving portions to self-contained dialog entries,
and then jumping to the appropriate id when necessary.

Usage:
	{jump "dialogId"}
	{jumpNow "dialogId"}

Note: be careful of infinite loops, e.g.
DLG_infinite_loop
"""
this will print forever{jump "DLG_infinite_loop"}
"""

HOW TO USE:
Copy-paste into a script tag after the bitsy source
*/

import bitsy from 'bitsy';
import { addDualDialogTag } from './helpers/kitsy-script-toolkit';

// jump function
function jump(targetDialog) {
	if (!targetDialog) {
		console.warn('Tried to jump to dialog, but no target dialog provided');
		return;
	}
	bitsy.startSpriteDialog({ dlg: targetDialog });
	bitsy.dialogBuffer.Continue();
}

addDualDialogTag('jump', function (parameters) {
	jump(parameters[0]);
});

/**
📝
@file edit dialog from dialog
@summary edit dialog from dialog (yes really)
@license MIT
@version auto
@requires 8.0
@author Sean S. LeBlanc

@description
You can use this to edit the dialog of sprites/items through dialog.

(dialog "map, target, newDialog")
Parameters:
	map:       Type of image (SPR or ITM)
	target:    id/name of image to edit
	newDialog: new dialog text

Examples:
{dialog "2" "I am not a cat"}

HOW TO USE:
	Copy-paste this script into a new script tag after the Bitsy source code.

TIPS:
	- The player avatar is always a sprite with id "A"; you can edit your gamedata to give them a name for clarity
*/
import bitsy from 'bitsy';
import { addDeferredDialogTag } from './helpers/kitsy-script-toolkit';
import { getImage } from './helpers/utils';

function editDialog(parameters) {
	var tgtId = parameters[0];
	var newDialog = parameters[1] || '';

	if (!tgtId) {
		throw new Error('dialog expects two parameters: "target newDialog", but received: "' + parameters.join(' ') + '"');
	}

	// get objects
	var tgtObj = getImage(tgtId);
	if (!tgtObj) {
		throw new Error('Target "' + tgtId + '" was not a valid tile id/name.');
	}
	bitsy.dialog[tgtObj.dlg].src = newDialog;
	bitsy.scriptInterpreter.Compile({ src: newDialog, id: tgtObj.dlg }, { doNotStore: false });
}

// hook up the dialog tag
addDeferredDialogTag('dialog', editDialog);

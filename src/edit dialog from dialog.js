/**
📝
@file edit dialog from dialog
@summary edit dialog from dialog (yes really)
@license MIT
@version 2.0.0
@requires 7.0
@author Sean S. LeBlanc

@description
You can use this to edit the dialog of sprites/items through dialog.

(dialog "map, target, newDialog")
Parameters:
	map:       Type of image (SPR or ITM)
	target:    id/name of image to edit
	newDialog: new dialog text

Examples:
(dialog "SPR, a, I am not a cat")

HOW TO USE:
	Copy-paste this script into a new script tag after the Bitsy source code.

TIPS:
	- The player avatar is always a sprite with id "A"; you can edit your gamedata to give them a name for clarity
	- You can use the full names or shorthand of image types (e.g. "SPR" and "sprite" will both work)
*/
import bitsy from 'bitsy';
import {
	addDeferredDialogTag,
	after,
} from './helpers/kitsy-script-toolkit';
import {
	getImage,
	inject,
} from './helpers/utils';

// map of maps
var maps;
after('load_game', function () {
	maps = {
		spr: bitsy.sprite,
		sprite: bitsy.sprite,
		itm: bitsy.item,
		item: bitsy.item,
	};
});

function editDialog(environment, parameters) {
	// parse parameters
	var params = parameters[0].split(/,\s?/);
	params[0] = (params[0] || '').toLowerCase();
	var mapId = params[0];
	var tgtId = params[1];
	var newDialog = params[2] || '';

	if (!mapId || !tgtId) {
		throw new Error('Image expects three parameters: "map, target, newDialog", but received: "' + params.join(', ') + '"');
	}

	// get objects
	var mapObj = maps[mapId];
	if (!mapObj) {
		throw new Error('Invalid map "' + mapId + '". Try "SPR" or "ITM" instead.');
	}
	var tgtObj = getImage(tgtId, mapObj);
	if (!tgtObj) {
		throw new Error('Target "' + tgtId + '" was not the id/name of a ' + mapId + '.');
	}
	bitsy.dialog[tgtObj.dlg].src = newDialog;
	bitsy.scriptInterpreter.Compile(tgtObj.dlg, newDialog);
}

// hook up the dialog tag
addDeferredDialogTag('dialog', editDialog);

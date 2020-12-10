/**
🖌
@file edit image from dialog
@summary edit sprites, items, and tiles from dialog
@license MIT
@version auto
@requires 8.0
@author Sean S. LeBlanc

@description
You can use this to edit the image data of sprites (including the player avatar), items, and tiles through dialog.
Image data can be replaced with data from another image, and the palette index can be set.

Note that this differs from the curlicue way of editing sprites:
Curlicue edits only the instances, which means changes will be lost
after leaving a room (except for the avatar).
This edits the originals too, so changes persist across rooms.

{image "target" "source"}
	target: id/name of image to edit
	source: id/name of image to copy

{imageNow "target" "source"}
	Same as {image}, but applied immediately instead of after dialog is closed.

{imagePal "target" "palette"}
	target: id/name of image to edit
	source: palette index (0 is bg, 1 is tiles, 2 is sprites/items)

{imagePalNow "target" "palette"}
	Same as {imagePal}, but applied immediately instead of after dialog is closed.

Examples:
	{image "A" "a"}
	{imageNow "a" "floor"}
	{image "a" "b"}
	{imagePal "A" "1"}
	{imagePalNow "floor" "2"}

HOW TO USE:
	1. Copy-paste this script into a new script tag after the Bitsy source code.

TIPS:
	- The player avatar is always a sprite with id "A"; you can edit your gamedata to give them a name for clarity
	- The "source" images don't have to be placed anywhere; so long as they exist in the gamedata they'll work
	- This is a destructive operation! Unless you have a copy of an overwritten image, you won't be able to get it back during that run
*/
import bitsy from 'bitsy';
import { addDualDialogTag } from './helpers/kitsy-script-toolkit';
import { getImage } from './helpers/utils';

function editImage(parameters) {
	var tgtId = parameters[0];
	var srcId = parameters[1];

	if (!tgtId || !srcId) {
		throw new Error('Image expects three parameters: "target, source", but received: "' + parameters.join(', ') + '"');
	}

	// get objects
	var tgtObj = getImage(tgtId);
	if (!tgtObj) {
		throw new Error('Target "' + tgtId + '" was not the id/name of a tile.');
	}
	var srcObj = getImage(srcId);
	if (!srcObj) {
		throw new Error('Source "' + srcId + '" was not the id/name of a tile.');
	}
	tgtObj.drw = srcObj.drw;
	Object.values(bitsy.spriteInstances).forEach(function (instance) {
		if (instance.id === tgtObj.id) {
			instance.drw = srcObj.drw;
		}
	});
}

function editPalette(parameters) {
	var tgtId = parameters[0];
	var palId = parameters[1];

	if (!tgtId || !palId) {
		throw new Error('Image expects three parameters: "target, palette", but received: "' + parameters.join(', ') + '"');
	}

	// get objects
	var tgtObj = getImage(tgtId);
	if (!tgtObj) {
		throw new Error('Target "' + tgtId + '" was not the id/name of a ' + mapId + '.');
	}
	var palObj = parseInt(palId, 10);
	if (Number.isNaN(Number(palObj))) {
		throw new Error('Palette "' + palId + '" was not a number.');
	}

	// set palette
	tgtObj.col = palObj;
}

// hook up the dialog tags
addDualDialogTag('image', editImage);
addDualDialogTag('imagePal', editPalette);

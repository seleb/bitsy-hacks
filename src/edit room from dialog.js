/**
🏠
@file edit room from dialog
@summary modify the content of a room from dialog
@license MIT
@version 1.0.2
@requires Bitsy Version: 6.1
@author Dana Holdampf

@description
This hack allows you to add, remove, or reposition tiles, sprites, and items.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Use the following dialog tags to edit a room's tiles, sprites, or items

-- DRAW DIALOG TAG REFERENCE -----------------------------------

{draw "type, source, x, y, room"}
{drawNow "type, source, x, y, room"}
{drawBox "type, source, x1, y1, x2, y2 room"}
{drawBoxNow "type, source, x1, y1, x2, y2 room"}
{drawAll "type, source, room"}
{drawAllNow "type, source, room"}

Information:
- "draw" creates a tile, item, or sprite at a location in a room. Can be a fixed position, or relative to the player.
- "drawBox" is as above, but draws tiles, items, or sprites in a box/line, defined by a top left and bottom right corner.
- "drawAll" is as above, but affects an entire room.
- Adding "Now" causes it to draw immediately, rather than waiting until the dialog ends.

Parameters:
- type:		Type of room contents to draw (TIL, ITM, or SPR)
			Tile (TIL): Each location can have only one Tile. Drawing over an existing tile replaces it.
			Item (ITM): Multiple items can exist in one spot, but only the most recent item is picked up.
			Sprite (SPR): Only one copy of each Sprite can exist at a time; redrawing a sprite moves it.
- source:	The ID (number/letter) of the tile, item, or sprite to draw.
- x, y:		The x and y coordinates you want to draw at, from 0-15.
- x1, y1:	(For drawBox only) The x and y coordinates of the top left tile you want to draw on, from 0-15.
- x2, y2:	(For drawBox only) The x and y coordinates of the bottom right tile you want to draw on, from 0-15.
			Put + or - before any coordinate to draw relative to the player's current position. (ex. +10, -2, etc.).
			Leave any coordinate blank (or use +0) to use the player's current X (or Y) position. (If blank, still add commas)
- room:		The ID (number/letter) of the room you're drawing in. (Refer to Game Data tab for Room IDs)
			Leave blank to default to modifying the room the player is currently in.

-- ERASE DIALOG TAG REFERENCE ----------------------------------

{erase "type, target, x, y, room"}
{eraseNow "type, target, x, y, room"}
{eraseBox "type, target, x1, y1, x2, y2 room"}
{eraseBoxNow "type, target, x1, y1, x2, y2 room"}
{eraseAll "type, target, room"}
{eraseAllNow "type, target, room"}

Information:
- "erase" Removes tiles, items, or sprites at a location in a room. Can be a fixed position, or relative to the player.
- "eraseBox" is as above, but erases tiles, items, or sprites in a box/line, defined by a top left and bottom right corner.
- "eraseAll" is as above, but affects an entire room.
- Adding "Now" causes it to erase immediately, rather than waiting until the dialog ends.

Parameters:
- type:		Type of room contents to erase (ANY, TIL, ITM, or SPR)
			Anything (ANY): Erasing anything will target all valid Tiles, Items, and Sprites.
			Tile (TIL): Erasing a Tile causes that location to be empty and walkable.
			Item (ITM): Erasing an Item affects all valid target items, even if there are more than one.
			Sprite (SPR): Erasing a Sprite removes it from a room, but it will remember dialog progress, etc.
			Leaving this blank will default to targeting ANY. (If blank, still include commas)
- target:	The ID (number/letter) of the tile, item, or sprite to erase. Other objects will not be erased.
			Leave this blank, or set this to "ANY", to target all tiles, items, and/or sprites. (If blank, still include commas)
- x, y:		The x and y coordinates you want to erase at, from 0-15.
- x1, y1:	(For eraseBox only) The x and y coordinates of the top left tile you want to erase at, from 0-15.
- x2, y2:	(For eraseBox only) The x and y coordinates of the bottom right tile you want to erase at, from 0-15.
			Leave X (or Y) blank to use the player's current X (or Y) position. (If blank, still include commas)
			Put + or - before the number to erase relative to the player's current position. (ex. +10, -2, etc.).
- room:		The ID (number/letter) of the room you're erasing in. (Refer to Game Data tab for Room IDs)
			Leave blank to default to modifying the room the player is currently in.

-- REPLACE DIALOG TAG REFERENCE --------------------------------

{replace "targetType, targetId, newType, newId, x, y, room"}
{replaceNow "targetType, targetId, newType, newId, x, y, room"}
{replaceBox "targetType, targetId, newType, newId, x1, y1, x2, y2 room"}
{replaceBoxNow "targetType, targetId, newType, newId, x1, y1, x2, y2 room"}
{replaceAll "targetType, targetId, newType, newId, room"}
{replaceAllNow "targetType, targetId, newType, newId, room"}

Information:
- "replace" Combines erase and draw. Removes tiles, items, or sprites at a location in a room, and replaces each with something new.
- "replaceBox" is as above, but replaces tiles, items, or sprites in a box/line, defined by a top left and bottom right corner.
- "replaceAll" is as above, but affects an entire room.
- Adding "Now" causes it to erase immediately, rather than waiting until the dialog ends.

Parameters:
- targetType:	Type of room contents to target for replacing (ANY, TIL, ITM, or SPR).
				Anything (ANY): Targeting anything will target all valid Tiles, Items, and Sprites.
				Tile (TIL): Replacing a Tile will remove it, leaving behind walkable space.
				Item (ITM): Replacing an Item affects all valid items, even if there are more than one.
				Sprite (SPR): Replacing a Sprite removes it from a room, but it will remember dialog progress, etc.
				Leaving this blank will default to targeting ANY. (If blank, still include commas)
- targetId:		The ID (number/letter) of the tile, item, or sprite to replace. Other objects will not be replaced.
				Leave this blank, or set this to "ANY", to target all tiles, items, and/or sprites. (If blank, still include commas)
- newType:		As above, but defines the type of room contents to replace the target with (TIL, ITM, or SPR).
				Note: This must be defined, and cannot be left blank.
- newId:		As above, but defines the ID (number/letter) of the tile, item, or sprite to replace the target with.
				Note: This must be defined, and cannot be left blank.
- x, y:			The x and y coordinates you want to replace at, from 0-15.
- x1, y1:		(For replaceBox only) The x and y coordinates of the top left tile you want to replace at, from 0-15.
- x2, y2:		(For replaceBox only) The x and y coordinates of the bottom right tile you want to replace at, from 0-15.
				Leave X (or Y) blank to use the player's current X (or Y) position. (If blank, still include commas)
				Put + or - before the number to replace relative to the player's current position. (ex. +10, -2, etc.).
- room:			The ID (number/letter) of the room you're replacing in. (Refer to Game Data tab for Room IDs)
				Leave blank to default to modifying the room the player is currently in.

-- COPY DIALOG TAG REFERENCE -----------------------------------

{copy "type, target, copyX, copyY, copyRoom, pasteX, pasteY, pasteRoom"}
{copyNow "type, target, copyX, copyY, copyRoom, pasteX, pasteY, pasteRoom"}
{copyBox "type, target, copyX1, copyY1, copyX2, copyY2, copyRoom, pasteX, pasteY, pasteRoom"}
{copyBoxNow "type, target, copyX1, copyY1, copyX2, copyY2, copyRoom, pasteX, pasteY, pasteRoom"}
{copyAll "type, target, copyRoom, pasteRoom"}
{copyAllNow "type, target, copyRoom, pasteRoom"}

Information:
- "copy" find tiles, items, or sprites at a location in a room, and duplicates each at a new location (may be in a different room).
- "copyBox" is as above, but copies tiles, items, or sprites in a box/line, defined by a top left and bottom right corner.
- "copyAll" is as above, but affects an entire room.
- Adding "Now" causes it to copy immediately, rather than waiting until the dialog ends.

Parameters:
- type:				Type of room contents to target for copying (ANY, TIL, ITM, or SPR).
					Anything (ANY): Targeting anything will copy all valid Tiles, Items, and Sprites.
					Tile (TIL): Each location can have only one Tile. Copying over an existing tile replaces it.
					Item (ITM): Multiple items can exist in one spot, and all valid items will be copied.
					Sprite (SPR): Only one copy of each Sprite can exist at a time; copying a sprite moves it.
					Leaving this blank will default to targeting ANY. (If blank, still include commas)
- target:			The ID (number/letter) of the tile, item, or sprite to copy. Other objects will not be copied.
					Leave this blank, or set this to "ANY", to target all tiles, items, and/or sprites. (If blank, still include commas)
- copyX, copyY:		The x and y coordinates you want to copy from, from 0-15.
- copyX1, copyY1:	(For copyBox only) The x and y coordinates of the top left tile you want to copy from, from 0-15.
- copyX2, copyY2:	(For copyBox only) The x and y coordinates of the bottom right tile you want to copy from, from 0-15.
					Leave X (or Y) blank to use the player's current X (or Y) position. (If blank, still include commas)
					Put + or - before the number to replace relative to the player's current position. (ex. +10, -2, etc.).
- copyRoom:			The ID (number/letter) of the room you're copying from. (Refer to Game Data tab for Room IDs)
					Leave blank to default to copy from the room the player is currently in.
- pasteX, pasteY:	The x and y coordinates you want to paste copied tiles too, from 0-15.
					For copyBox, this position marks the upper-left corner of the pasted box.
- pasteRoom:		As above, but marks the ID (number/letter) of the room you're pasting into.
					Leave blank to default to paste to the room the player is currently in.
* */

import bitsy from 'bitsy';
import {
	addDialogTag,
	addDeferredDialogTag,
} from './helpers/kitsy-script-toolkit';

// Draws an Item, Sprite, or Tile at a location in a room
// {draw "mapId, sourceId, xPos, yPos, roomID"}
// {drawNow "mapId, sourceId, xPos, yPos, roomID"}
addDialogTag('drawNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	drawAt(params[0], params[1], params[2], params[3], params[4]);
	onReturn(null);
});
addDeferredDialogTag('draw', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	drawAt(params[0], params[1], params[2], params[3], params[4]);
});

// As above, but affects a box area, between two corners.
// {drawBox "mapId, sourceId, x1, y1, x2, y2, roomID"}
// {drawBoxNow "mapId, sourceId, x1, y1, x2, y2, roomID"}
addDialogTag('drawBoxNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	drawBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
	onReturn(null);
});
addDeferredDialogTag('drawBox', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	drawBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
});

// As above, but affects an entire room.
// {drawAll "mapId, sourceId, roomID"}
// {drawAllNow "mapId, sourceId, roomID"}
addDialogTag('drawAllNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	drawBoxAt(params[0], params[1], 0, 0, 15, 15, params[2]);
	onReturn(null);
});
addDeferredDialogTag('drawAll', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	drawBoxAt(params[0], params[1], 0, 0, 15, 15, params[2]);
});

// Removes Items, Sprites, and/or Tiles at a location in a room
// {erase "mapId, targetId, xPos, yPos, roomID"}
// {eraseNow "mapId, targetId, xPos, yPos, roomID"}
addDialogTag('eraseNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	eraseAt(params[0], params[1], params[2], params[3], params[4]);
});
addDeferredDialogTag('erase', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	eraseAt(params[0], params[1], params[2], params[3], params[4]);
});

// As above, but affects a box area, between two corners.
// {eraseBox "mapId, targetId, x1, y1, x2, y2, roomID"}
// {eraseBoxNow "mapId, targetId, x1, y1, x2, y2, roomID"}
addDialogTag('eraseBoxNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	eraseBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
	onReturn(null);
});
addDeferredDialogTag('eraseBox', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	eraseBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
});

// As above, but affects an entire room.
// {eraseAll "mapId, targetId, roomID"}
// {eraseAllNow "mapId, targetId, roomID"}
addDialogTag('eraseAllNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	eraseBoxAt(params[0], params[1], 0, 0, 15, 15, params[2]);
	onReturn(null);
});
addDeferredDialogTag('eraseAll', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	eraseBoxAt(params[0], params[1], 0, 0, 15, 15, params[2]);
});

// Converts instances of target Item, Sprite, or Tile at a location in a room into something new
// {replace "targetMapId, targetId, newMapId, newId, xPos, yPos, roomID"}
// {replaceNow "targetMapId, targetId, newMapId, newId, xPos, yPos, roomID"}
addDialogTag('replaceNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	replaceAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
});
addDeferredDialogTag('replace', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	replaceAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
});

// As above, but affects a box area between two corners.
// {replaceBox "targetMapId, targetId, newMapId, newId, x1, y1, x2, y2, roomID"}
// {replaceBoxNow "targetMapId, targetId, newMapId, newId, x1, y1, x2, y2, roomID"}
addDialogTag('replaceBoxNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	replaceBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8]);
});
addDeferredDialogTag('replaceBox', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	replaceBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8]);
});

// As above, but affects an entire room.
// {replaceAll "targetMapId, targetId, newMapId, roomID"}
// {replaceAllNow "targetMapId, targetId, newMapId, newId, roomID"}
addDialogTag('replaceAllNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	replaceBoxAt(params[0], params[1], params[2], params[3], 0, 0, 15, 15, params[4]);
});
addDeferredDialogTag('replaceAll', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	replaceBoxAt(params[0], params[1], params[2], params[3], 0, 0, 15, 15, params[4]);
});

// Duplicates Items, Sprites, and/or Tiles from one location in a room to another
// {copy "mapId, targetId, copyX, copyY, copyRoom, pasteX, pasteY, pasteRoom"}
// {copyNow "mapId, targetId, copyX, copyY, copyRoom, pasteX, pasteY, pasteRoom"}
addDialogTag('copyNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	copyAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7]);
	onReturn(null);
});
addDeferredDialogTag('copy', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	copyAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7]);
});

// As above, but copies a box area between two corners, and pastes at a new spot designating the upper-left corner
// NOTE: positioning the paste coordinates out of bounds will only draw the section overlapping with the room.
// {copyBox "mapId, targetId, copyX1, copyY1, copyX2, copyY2, copyRoom, pasteX, pasteY, pasteRoom"}
// {copyBoxNow "mapId, targetId, copyX1, copyY1, copyX2, copyY2, copyRoom, pasteX, pasteY, pasteRoom"}
addDialogTag('copyBoxNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	copyBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], params[9]);
	onReturn(null);
});
addDeferredDialogTag('copyBox', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	copyBoxAt(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], params[9]);
});

// As above, but affects an entire room.
// {copyAll "mapId, targetId, copyRoom, pasteRoom"}
// {copyAllNow "mapId, targetId, copyRoom, pasteRoom"}
addDialogTag('copyAllNow', function (environment, parameters, onReturn) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	copyBoxAt(params[0], params[1], 0, 0, 15, 15, params[3], 0, 0, params[4]);
	onReturn(null);
});
addDeferredDialogTag('copyAll', function (environment, parameters) {
	var params = (parameters[0] != undefined) ? parameters[0].split(',') : {
		undefined,
	};
	copyBoxAt(params[0], params[1], 0, 0, 15, 15, params[3], 0, 0, params[4]);
});

function drawAt(mapId, sourceId, xPos, yPos, roomId) {
	// Trim and sanitize Map ID / Type parameter, and return if not provided.
	if (mapId == undefined) {
		console.log("CAN'T DRAW. DRAW TYPE IS UNDEFINED. TIL, ITM, OR SPR EXPECTED.");
		return;
	}

	mapId = mapId.toString().trim();
	if (mapId == '' || !(mapId.toUpperCase() == 'TIL' || mapId.toUpperCase() == 'ITM' || mapId.toUpperCase() == 'SPR')) {
		console.log("CAN'T DRAW. UNEXPECTED DRAW TYPE (" + mapId + '). TIL, ITM, OR SPR EXPECTED.');
		return;
	}


	// Trim and sanitize Source ID parameter, and return if not provided
	if (sourceId == undefined) {
		console.log("CAN'T DRAW. SOURCE ID IS UNDEFINED. TILE, ITEM, OR SPRITE ID EXPECTED.");
		return;
	}

	sourceId = sourceId.toString().trim();
	if (sourceId == '') {
		console.log("CAN'T DRAW. NO SOURCE ID GIVEN. TILE, ITEM, OR SPRITE ID EXPECTED.");
		return;
	}


	// Trim and sanitize X Position parameter, and set relative positions, even if omitted.
	if (xPos == undefined) {
		xPos = bitsy.player().x;
	} else {
		xPos = xPos.toString().trim();
		if (xPos == '') {
			xPos = bitsy.player().x;
		} else if (xPos.includes('+')) {
			xPos = bitsy.player().x + parseInt(xPos.substring(1), 10);
		} else if (xPos.includes('-')) {
			xPos = bitsy.player().x - parseInt(xPos.substring(1), 10);
		}
	}
	if (xPos < 0 || xPos > 15) {
		console.log("CAN'T DRAW. X POSITION (" + xPos + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		return;
	}

	// Trim and sanitize Y Position parameter, and set relative positions, even if omitted
	if (yPos == undefined) {
		yPos = bitsy.player().y;
	} else {
		yPos = yPos.toString().trim();
		if (yPos == '') {
			yPos = bitsy.player().y;
		} else if (yPos.includes('+')) {
			yPos = bitsy.player().y + parseInt(yPos.substring(1), 10);
		} else if (yPos.includes('-')) {
			yPos = bitsy.player().y - parseInt(yPos.substring(1), 10);
		}
	}
	if (yPos < 0 || yPos > 15) {
		console.log("CAN'T DRAW. Y POSITION (" + yPos + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		return;
	}

	// Trim and sanitize Room ID parameter, and set to current room if omitted
	if (roomId == undefined) {
		roomId = bitsy.curRoom;
	} else {
		roomId = roomId.toString().trim();
		if (roomId == '') {
			roomId = bitsy.curRoom;
		} else if (bitsy.room[roomId] == undefined) {
			console.log("CAN'T DRAW. ROOM ID (" + roomId + ') NOT FOUND.');
			return;
		}
	}

	// console.log ("DRAWING "+mapId+" "+sourceId+" at "+xPos+","+yPos+"(Room "+roomId+")");

	if (mapId.toUpperCase() == 'TIL') {
		if (bitsy.tile[sourceId] != undefined) {
			bitsy.room[roomId].tilemap[yPos][xPos] = sourceId;
		}
	} else if (mapId.toUpperCase() == 'ITM') {
		if (bitsy.item[sourceId] != undefined) {
			var newItem = {
				id: sourceId,
				x: xPos,
				y: yPos,
			};
			bitsy.room[roomId].items.push(newItem);
		}
	} else if (mapId.toUpperCase() == 'SPR') {
		if (bitsy.sprite[sourceId] != undefined) {
			if (bitsy.sprite[sourceId].id == 'A') {
				console.log("CAN'T TARGET AVATAR. SKIPPING.");
			} else if (bitsy.room[roomId] != undefined) {
				bitsy.sprite[sourceId].room = roomId;
				bitsy.sprite[sourceId].x = xPos;
				bitsy.sprite[sourceId].y = yPos;
			}
		}
	}
}

function drawBoxAt(mapId, sourceId, x1, y1, x2, y2, roomId) {
	// Trim and sanitize X and Y Positions, and set relative positions if omitted.
	if (x1 == undefined) {
		x1 = bitsy.player().x;
	} else {
		x1 = x1.toString().trim();
		if (x1 == '') {
			x1 = bitsy.player().x;
		} else if (x1.includes('+')) {
			x1 = bitsy.player().x + parseInt(x1.substring(1), 10);
		} else if (x1.includes('-')) {
			x1 = bitsy.player().x - parseInt(x1.substring(1), 10);
		}
	}
	if (x1 < 0 || x1 > 15) {
		console.log('CLAMPING X1 POSITION. XPOS (' + x1 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		x1 = Math.max(0, Math.min(x1, 15));
	}
	// X2
	if (x2 == undefined) {
		x2 = bitsy.player().x;
	} else {
		x2 = x2.toString().trim();
		if (x2 == '') {
			x2 = bitsy.player().x;
		} else if (x2.includes('+')) {
			x2 = bitsy.player().x + parseInt(x2.substring(1), 10);
		} else if (x2.includes('-')) {
			x2 = bitsy.player().x - parseInt(x2.substring(1), 10);
		}
	}
	if (x2 < 0 || x2 > 15) {
		console.log('CLAMPING X2 POSITION. xPos (' + x2 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		x2 = Math.max(0, Math.min(x2, 15));
	}
	// Y1
	if (y1 == undefined) {
		y1 = bitsy.player().y;
	} else {
		y1 = y1.toString().trim();
		if (y1 == '') {
			y1 = bitsy.player().y;
		} else if (y1.includes('+')) {
			y1 = bitsy.player().y + parseInt(y1.substring(1), 10);
		} else if (y1.includes('-')) {
			y1 = bitsy.player().y - parseInt(y1.substring(1), 10);
		}
	}
	if (y1 < 0 || y1 > 15) {
		console.log('CLAMPING Y1 POSITION. XPOS (' + y1 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		y1 = Math.max(0, Math.min(y1, 15));
	}
	// Y2
	if (y2 == undefined) {
		y2 = bitsy.player().y;
	} else {
		y2 = y2.toString().trim();
		if (y2 == '') {
			y2 = bitsy.player().y;
		} else if (y2.includes('+')) {
			y2 = bitsy.player().y + parseInt(y2.substring(1), 10);
		} else if (y2.includes('-')) {
			y2 = bitsy.player().y - parseInt(y2.substring(1), 10);
		}
	}
	if (y2 < 0 || y2 > 15) {
		console.log('CLAMPING Y2 POSITION. xPos (' + y2 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		y2 = Math.max(0, Math.min(y2, 15));
	}

	// Calculate which coordinates are the actual top left and bottom right.
	var topPos = Math.min(y1, y2);
	var leftPos = Math.min(x1, x2);
	var bottomPos = Math.max(y1, y2);
	var rightPos = Math.max(x1, x2);

	for (var xPos = leftPos; xPos <= rightPos; xPos++) {
		for (var yPos = topPos; yPos <= bottomPos; yPos++) {
			drawAt(mapId, sourceId, xPos, yPos, roomId);
		}
	}
}

function eraseAt(mapId, targetId, xPos, yPos, roomId) {
	// Trim and sanitize Map ID / Type parameter, and use any if not provided.
	if (mapId == undefined) {
		// console.log("ERASE TYPE IS UNDEFINED. DEFAULTING TO ANY (TIL, ITM, OR SPR).");
		mapId = 'ANY';
	} else {
		mapId = mapId.toString().trim();
		if (mapId == '' || !(mapId.toUpperCase() == 'ANY' || mapId.toUpperCase() == 'TIL' || mapId.toUpperCase() == 'ITM' || mapId.toUpperCase() == 'SPR')) {
			// console.log("UNEXPECTED ERASE TYPE ("+mapId+"). DEFAULTING TO ANY (TIL, ITM, OR SPR).");
			mapId = 'ANY';
		}
	}

	// Trim and sanitize Target ID parameter, and use any if not provided
	if (targetId == undefined) {
		// console.log("TARGET ID UNDEFINED. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
		targetId = 'ANY';
	} else {
		targetId = targetId.toString().trim();
		if (targetId == '') {
			// console.log("NO TARGET ID GIVEN. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
			targetId = 'ANY';
		}
		// mapId = (mapId != "" || mapId.toUpperCase() != "ANY") ? mapId : "ANY";
	}

	// Trim and sanitize X Position parameter, and set relative positions, even if omitted.
	if (xPos == undefined) {
		xPos = bitsy.player().x;
	} else {
		xPos = xPos.toString().trim();
		if (xPos == '') {
			xPos = bitsy.player().x;
		} else if (xPos.includes('+')) {
			xPos = bitsy.player().x + parseInt(xPos.substring(1), 10);
		} else if (xPos.includes('-')) {
			xPos = bitsy.player().x - parseInt(xPos.substring(1), 10);
		}
	}
	if (xPos < 0 || xPos > 15) {
		console.log("CAN'T DRAW. X POSITION (" + xPos + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		return;
	}

	// Trim and sanitize Y Position parameter, and set relative positions, even if omitted
	if (yPos == undefined) {
		yPos = bitsy.player().y;
	} else {
		yPos = yPos.toString().trim();
		if (yPos == '') {
			yPos = bitsy.player().y;
		} else if (yPos.includes('+')) {
			yPos = bitsy.player().y + parseInt(yPos.substring(1), 10);
		} else if (yPos.includes('-')) {
			yPos = bitsy.player().y - parseInt(yPos.substring(1), 10);
		}
	}
	if (yPos < 0 || yPos > 15) {
		console.log("CAN'T DRAW. Y POSITION (" + yPos + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		return;
	}

	// Trim and sanitize Room ID parameter, and set to current room if omitted
	if (roomId == undefined) {
		roomId = bitsy.curRoom;
	} else {
		roomId = roomId.toString().trim();
		if (roomId == '') {
			roomId = bitsy.curRoom;
		} else if (bitsy.room[roomId] == undefined) {
			console.log("CAN'T DRAW. ROOM ID (" + roomId + ') NOT FOUND.');
			return;
		}
	}

	// console.log ("REMOVING "+mapId+" "+targetId+" at "+xPos+","+yPos+"(Room "+roomId+")");

	// If TIL or undefined.
	if (mapId.toUpperCase() != 'ITM' && mapId.toUpperCase() != 'SPR') {
		if (targetId == 'ANY' || bitsy.room[roomId].tilemap[yPos][xPos] == targetId) {
			bitsy.room[roomId].tilemap[yPos][xPos] = '0';
		}
	}

	// If ITM or undefined.
	if (mapId.toUpperCase() != 'TIL' && mapId.toUpperCase() != 'SPR') {
		// Iterate backwards through items, to prevent issues with removed indexes
		for (var i = bitsy.room[roomId].items.length - 1; i >= 0; i--) {
			var targetItem = bitsy.room[roomId].items[i];
			if (targetId == 'ANY' || targetId == targetItem.id) {
				if (targetItem.x == xPos && targetItem.y == yPos) {
					bitsy.room[roomId].items.splice(i, 1);
				}
			}
		}
	}

	// If SPR or undefined.
	if (mapId.toUpperCase() != 'TIL' && mapId.toUpperCase() != 'ITM') {
		if (targetId == 'ANY') {
			for (i in bitsy.sprite) {
				if (bitsy.sprite[i].id == 'A') {
					console.log("CAN'T TARGET AVATAR. SKIPPING.");
				} else if (bitsy.sprite[i].room == roomId && bitsy.sprite[i].x == xPos && bitsy.sprite[i].y == yPos) {
					bitsy.sprite[i].x = 0;
					bitsy.sprite[i].y = 0;
					bitsy.sprite[i].room = 'default';
				}
			}
		} else if (bitsy.sprite[targetId] != undefined) {
			if (bitsy.sprite[targetId].id == 'A') {
				console.log("CAN'T TARGET AVATAR. SKIPPING.");
			} else if (bitsy.sprite[targetId].room == roomId && bitsy.sprite[targetId].x == xPos && bitsy.sprite[targetId].y == yPos) {
				bitsy.sprite[targetId].x = 0;
				bitsy.sprite[targetId].y = 0;
				bitsy.sprite[targetId].room = 'default';
			}
		}
	}
}

function eraseBoxAt(mapId, targetId, x1, y1, x2, y2, roomId) {
	// Trim and sanitize X and Y Positions, and set relative positions if omitted.
	if (x1 == undefined) {
		x1 = bitsy.player().x;
	} else {
		x1 = x1.toString().trim();
		if (x1 == '') {
			x1 = bitsy.player().x;
		} else if (x1.includes('+')) {
			x1 = bitsy.player().x + parseInt(x1.substring(1), 10);
		} else if (x1.includes('-')) {
			x1 = bitsy.player().x - parseInt(x1.substring(1), 10);
		}
	}
	if (x1 < 0 || x1 > 15) {
		console.log('CLAMPING X1 POSITION. XPOS (' + x1 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		x1 = Math.max(0, Math.min(x1, 15));
	}
	// X2
	if (x2 == undefined) {
		x2 = bitsy.player().x;
	} else {
		x2 = x2.toString().trim();
		if (x2 == '') {
			x2 = bitsy.player().x;
		} else if (x2.includes('+')) {
			x2 = bitsy.player().x + parseInt(x2.substring(1), 10);
		} else if (x2.includes('-')) {
			x2 = bitsy.player().x - parseInt(x2.substring(1), 10);
		}
	}
	if (x2 < 0 || x2 > 15) {
		console.log('CLAMPING X2 POSITION. xPos (' + x2 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		x2 = Math.max(0, Math.min(x2, 15));
	}
	// Y1
	if (y1 == undefined) {
		y1 = bitsy.player().y;
	} else {
		y1 = y1.trim();
		if (y1 == '') {
			y1 = bitsy.player().y;
		} else if (y1.includes('+')) {
			y1 = bitsy.player().y + parseInt(y1.substring(1), 10);
		} else if (y1.includes('-')) {
			y1 = bitsy.player().y - parseInt(y1.substring(1), 10);
		}
	}
	if (y1 < 0 || y1 > 15) {
		console.log('CLAMPING Y1 POSITION. XPOS (' + y1 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		y1 = Math.max(0, Math.min(y1, 15));
	}
	// Y2
	if (y2 == undefined) {
		y2 = bitsy.player().y;
	} else {
		y2 = y2.toString().trim();
		if (y2 == '') {
			y2 = bitsy.player().y;
		} else if (y2.includes('+')) {
			y2 = bitsy.player().y + parseInt(y2.substring(1), 10);
		} else if (y2.includes('-')) {
			y2 = bitsy.player().y - parseInt(y2.substring(1), 10);
		}
	}
	if (y2 < 0 || y2 > 15) {
		console.log('CLAMPING Y2 POSITION. xPos (' + y2 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		y2 = Math.max(0, Math.min(y2, 15));
	}

	// Calculate which coordinates are the actual top left and bottom right.
	var topPos = Math.min(y1, y2);
	var leftPos = Math.min(x1, x2);
	var bottomPos = Math.max(y1, y2);
	var rightPos = Math.max(x1, x2);

	for (var xPos = leftPos; xPos <= rightPos; xPos++) {
		for (var yPos = topPos; yPos <= bottomPos; yPos++) {
			eraseAt(mapId, targetId, xPos, yPos, roomId);
		}
	}
}

function replaceAt(targetMapId, targetId, newMapId, newId, xPos, yPos, roomId) {
	// Trim and sanitize Target Map ID / Type parameter, and use any if not provided.
	if (targetMapId == undefined) {
		// console.log("TARGET TYPE IS UNDEFINED. DEFAULTING TO ANY (TIL, ITM, OR SPR).");
		targetMapId = 'ANY';
	} else {
		targetMapId = targetMapId.toString().trim();
		if (targetMapId == '' || !(targetMapId.toUpperCase() == 'ANY' || targetMapId.toUpperCase() == 'TIL' || targetMapId.toUpperCase() == 'ITM' || targetMapId.toUpperCase() == 'SPR')) {
			// console.log("UNEXPECTED TARGET TYPE ("+targetMapId+"). DEFAULTING TO ANY (TIL, ITM, OR SPR).");
			targetMapId = 'ANY';
		}
	}

	// Trim and sanitize Target ID parameter, and use any if not provided
	if (targetId == undefined) {
		// console.log("TARGET ID UNDEFINED. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
		targetId = 'ANY';
	} else {
		targetId = targetId.toString().trim();
		if (targetId == '') {
			// console.log("NO TARGET ID GIVEN. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
			targetId = 'ANY';
		}
	}

	// Trim and sanitize New Map ID / Type parameter, and return if not provided.
	if (newMapId == undefined) {
		console.log('CANNOT REPLACE. REPLACING TYPE IS UNDEFINED. TIL, ITM, OR SPR EXPECTED.');
		return;
	}

	newMapId = newMapId.toString().trim();
	if (newMapId == '' || !(newMapId.toUpperCase() == 'TIL' || newMapId.toUpperCase() == 'ITM' || newMapId.toUpperCase() == 'SPR')) {
		console.log('CANNOT REPLACE. UNEXPECTED REPLACING TYPE (' + newMapId + '). TIL, ITM, OR SPR EXPECTED.');
		return;
	}


	// Trim and sanitize New Target ID parameter, and return if not provided
	if (newId == undefined) {
		console.log('CANNOT REPLACE. NEW TARGET ID UNDEFINED. VALID ID EXPECTED).');
		return;
	}

	newId = newId.toString().trim();
	if (newId == '') {
		console.log('CANNOT REPLACE. NO NEW TARGET ID GIVEN. VALID ID EXPECTED');
		return;
	}


	// Trim and sanitize X Position parameter, and set relative positions, even if omitted.
	if (xPos == undefined) {
		xPos = bitsy.player().x;
	} else {
		xPos = xPos.toString().trim();
		if (xPos == '') {
			xPos = bitsy.player().x;
		} else if (xPos.includes('+')) {
			xPos = bitsy.player().x + parseInt(xPos.substring(1), 10);
		} else if (xPos.includes('-')) {
			xPos = bitsy.player().x - parseInt(xPos.substring(1), 10);
		}
	}
	if (xPos < 0 || xPos > 15) {
		console.log("CAN'T REPLACE. X POSITION (" + xPos + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		return;
	}

	// Trim and sanitize Y Position parameter, and set relative positions, even if omitted
	if (yPos == undefined) {
		yPos = bitsy.player().y;
	} else {
		yPos = yPos.toString().trim();
		if (yPos == '') {
			yPos = bitsy.player().y;
		} else if (yPos.includes('+')) {
			yPos = bitsy.player().y + parseInt(yPos.substring(1), 10);
		} else if (yPos.includes('-')) {
			yPos = bitsy.player().y - parseInt(yPos.substring(1), 10);
		}
	}
	if (yPos < 0 || yPos > 15) {
		console.log("CAN'T REPLACE. Y POSITION (" + yPos + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		return;
	}

	// Trim and sanitize Room ID parameter, and set to current room if omitted
	if (roomId == undefined) {
		roomId = bitsy.curRoom;
	} else {
		roomId = roomId.toString().trim();
		if (roomId == '') {
			roomId = bitsy.curRoom;
		} else if (bitsy.room[roomId] == undefined) {
			console.log("CAN'T REPLACE. ROOM ID (" + roomId + ') NOT FOUND.');
			return;
		}
	}

	// console.log ("REPLACING "+targetMapId+" "+targetId+" at "+xPos+","+yPos+"(Room "+roomId+")");
	// console.log ("REPLACING WITH "+newMapId+" "+newId);

	// If TIL or undefined.
	if (targetMapId.toUpperCase() != 'ITM' && targetMapId.toUpperCase() != 'SPR') {
		if (targetId == 'ANY' || bitsy.room[roomId].tilemap[yPos][xPos] == targetId) {
			bitsy.room[roomId].tilemap[yPos][xPos] = '0';
			drawAt(newMapId, newId, xPos, yPos, roomId);
		}
	}

	// If ITM or undefined.
	if (targetMapId.toUpperCase() != 'TIL' && targetMapId.toUpperCase() != 'SPR') {
		// Iterate backwards through items, to prevent issues with removed indexes
		for (var i = bitsy.room[roomId].items.length - 1; i >= 0; i--) {
			var targetItem = bitsy.room[roomId].items[i];
			if (targetId == 'ANY' || targetId == targetItem.id) {
				if (targetItem.x == xPos && targetItem.y == yPos) {
					bitsy.room[roomId].items.splice(i, 1);
					drawAt(newMapId, newId, xPos, yPos, roomId);
				}
			}
		}
	}

	// If SPR or undefined.
	if (targetMapId.toUpperCase() != 'TIL' && targetMapId.toUpperCase() != 'ITM') {
		if (targetId == 'ANY') {
			for (i in bitsy.sprite) {
				if (bitsy.sprite[i].id == 'A') {
					console.log("CAN'T TARGET AVATAR. SKIPPING.");
				} else if (bitsy.sprite[i].room == roomId && bitsy.sprite[i].x == xPos && bitsy.sprite[i].y == yPos) {
					bitsy.sprite[i].x = 0;
					bitsy.sprite[i].y = 0;
					bitsy.sprite[i].room = 'default';
					drawAt(newMapId, newId, xPos, yPos, roomId);
				}
			}
		} else if (bitsy.sprite[targetId] != undefined) {
			if (bitsy.sprite[targetId] != 'A' && bitsy.sprite[targetId].room == roomId && bitsy.sprite[targetId].x == xPos && bitsy.sprite[targetId].y == yPos) {
				bitsy.sprite[targetId].x = 0;
				bitsy.sprite[targetId].y = 0;
				bitsy.sprite[targetId].room = 'default';
				drawAt(newMapId, newId, xPos, yPos, roomId);
			}
		}
	}
}

function replaceBoxAt(targetMapId, targetId, newMapId, newId, x1, y1, x2, y2, roomId) {
	// Trim and sanitize X and Y Positions, and set relative positions if omitted.
	if (x1 == undefined) {
		x1 = bitsy.player().x;
	} else {
		x1 = x1.toString().trim();
		if (x1 == '') {
			x1 = bitsy.player().x;
		} else if (x1.includes('+')) {
			x1 = bitsy.player().x + parseInt(x1.substring(1), 10);
		} else if (x1.includes('-')) {
			x1 = bitsy.player().x - parseInt(x1.substring(1), 10);
		}
	}
	if (x1 < 0 || x1 > 15) {
		console.log('CLAMPING X1 POSITION. XPOS (' + x1 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		x1 = Math.max(0, Math.min(x1, 15));
	}
	// X2
	if (x2 == undefined) {
		x2 = bitsy.player().x;
	} else {
		x2 = x2.toString().trim();
		if (x2 == '') {
			x2 = bitsy.player().x;
		} else if (x2.includes('+')) {
			x2 = bitsy.player().x + parseInt(x2.substring(1), 10);
		} else if (x2.includes('-')) {
			x2 = bitsy.player().x - parseInt(x2.substring(1), 10);
		}
	}
	if (x2 < 0 || x2 > 15) {
		console.log('CLAMPING X2 POSITION. xPos (' + x2 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		x2 = Math.max(0, Math.min(x2, 15));
	}
	// Y1
	if (y1 == undefined) {
		y1 = bitsy.player().y;
	} else {
		y1 = y1.toString().trim();
		if (y1 == '') {
			y1 = bitsy.player().y;
		} else if (y1.includes('+')) {
			y1 = bitsy.player().y + parseInt(y1.substring(1), 10);
		} else if (y1.includes('-')) {
			y1 = bitsy.player().y - parseInt(y1.substring(1), 10);
		}
	}
	if (y1 < 0 || y1 > 15) {
		console.log('CLAMPING Y1 POSITION. XPOS (' + y1 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		y1 = Math.max(0, Math.min(y1, 15));
	}
	// Y2
	if (y2 == undefined) {
		y2 = bitsy.player().y;
	} else {
		y2 = y2.toString().trim();
		if (y2 == '') {
			y2 = bitsy.player().y;
		} else if (y2.includes('+')) {
			y2 = bitsy.player().y + parseInt(y2.substring(1), 10);
		} else if (y2.includes('-')) {
			y2 = bitsy.player().y - parseInt(y2.substring(1), 10);
		}
	}
	if (y2 < 0 || y2 > 15) {
		console.log('CLAMPING Y2 POSITION. xPos (' + y2 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		y2 = Math.max(0, Math.min(y2, 15));
	}

	// Calculate which coordinates are the actual top left and bottom right.
	var topPos = Math.min(y1, y2);
	var leftPos = Math.min(x1, x2);
	var bottomPos = Math.max(y1, y2);
	var rightPos = Math.max(x1, x2);

	for (var xPos = leftPos; xPos <= rightPos; xPos++) {
		for (var yPos = topPos; yPos <= bottomPos; yPos++) {
			replaceAt(targetMapId, targetId, newMapId, newId, xPos, yPos, roomId);
		}
	}
}

function copyAt(mapId, targetId, copyXPos, copyYPos, copyRoomId, pasteXPos, pasteYPos, pasteRoomId) {
	// Trim and sanitize Target Map ID / Type parameter, and use any if not provided.
	if (mapId == undefined) {
		// console.log("TARGET TYPE IS UNDEFINED. DEFAULTING TO ANY (TIL, ITM, OR SPR).");
		mapId = 'ANY';
	} else {
		mapId = mapId.toString().trim();
		if (mapId == '' || !(mapId.toUpperCase() == 'ANY' || mapId.toUpperCase() == 'TIL' || mapId.toUpperCase() == 'ITM' || mapId.toUpperCase() == 'SPR')) {
			// console.log("UNEXPECTED TARGET TYPE ("+mapId+"). DEFAULTING TO ANY (TIL, ITM, OR SPR).");
			mapId = 'ANY';
		}
	}

	// Trim and sanitize Target ID parameter, and use any if not provided
	if (targetId == undefined) {
		// console.log("TARGET ID UNDEFINED. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
		targetId = 'ANY';
	} else {
		targetId = targetId.toString().trim();
		if (targetId == '') {
			// console.log("NO TARGET ID GIVEN. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
			targetId = 'ANY';
		}
	}

	// Trim and sanitize Copy Position parameters, and set relative positions, even if omitted.
	if (copyXPos == undefined) {
		copyXPos = bitsy.player().x;
	} else {
		copyXPos = copyXPos.toString().trim();
		if (copyXPos == '') {
			copyXPos = bitsy.player().x;
		} else if (copyXPos.includes('+')) {
			copyXPos = bitsy.player().x + parseInt(copyXPos.substring(1), 10);
		} else if (copyXPos.includes('-')) {
			copyXPos = bitsy.player().x - parseInt(copyXPos.substring(1), 10);
		}
	}
	if (copyXPos < 0 || copyXPos > 15) {
		console.log("CAN'T COPY. X POSITION (" + copyXPos + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		return;
	}

	if (copyYPos == undefined) {
		copyYPos = bitsy.player().y;
	} else {
		copyYPos = copyYPos.toString().trim();
		if (copyYPos == '') {
			copyYPos = bitsy.player().y;
		} else if (copyYPos.includes('+')) {
			copyYPos = bitsy.player().y + parseInt(copyYPos.substring(1), 10);
		} else if (copyYPos.includes('-')) {
			copyYPos = bitsy.player().y - parseInt(copyYPos.substring(1), 10);
		}
	}
	if (copyYPos < 0 || copyYPos > 15) {
		console.log("CAN'T COPY. Y POSITION (" + copyYPos + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		return;
	}

	if (copyRoomId == undefined) {
		copyRoomId = bitsy.curRoom;
	} else {
		copyRoomId = copyRoomId.trim();
		if (copyRoomId == '') {
			copyRoomId = bitsy.curRoom;
		} else if (bitsy.room[copyRoomId] == undefined) {
			console.log("CAN'T COPY. ROOM ID (" + copyRoomId + ') NOT FOUND.');
			return;
		}
	}

	// Trim and sanitize Paste Position parameters, and set relative positions, even if omitted.
	if (pasteXPos == undefined) {
		pasteXPos = bitsy.player().x;
	} else {
		pasteXPos = pasteXPos.toString().trim();
		if (pasteXPos == '') {
			pasteXPos = bitsy.player().x;
		} else if (pasteXPos.includes('+')) {
			pasteXPos = bitsy.player().x + parseInt(pasteXPos.substring(1), 10);
		} else if (pasteXPos.includes('-')) {
			pasteXPos = bitsy.player().x - parseInt(pasteXPos.substring(1), 10);
		}
	}
	if (pasteXPos < 0 || pasteXPos > 15) {
		console.log("CAN'T PASTE. X POSITION (" + pasteXPos + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		return;
	}

	if (pasteYPos == undefined) {
		pasteYPos = bitsy.player().y;
	} else {
		pasteYPos = pasteYPos.toString().trim();
		if (pasteYPos == '') {
			pasteYPos = bitsy.player().y;
		} else if (pasteYPos.includes('+')) {
			pasteYPos = bitsy.player().y + parseInt(pasteYPos.substring(1), 10);
		} else if (pasteYPos.includes('-')) {
			pasteYPos = bitsy.player().y - parseInt(pasteYPos.substring(1), 10);
		}
	}
	if (pasteYPos < 0 || pasteYPos > 15) {
		console.log("CAN'T PASTE. Y POSITION (" + pasteYPos + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		return;
	}

	if (pasteRoomId == undefined) {
		pasteRoomId = bitsy.curRoom;
	} else {
		pasteRoomId = pasteRoomId.toString().trim();
		if (pasteRoomId == '') {
			pasteRoomId = bitsy.curRoom;
		} else if (bitsy.room[pasteRoomId] == undefined) {
			console.log("CAN'T PASTE. ROOM ID (" + pasteRoomId + ') NOT FOUND.');
			return;
		}
	}

	// console.log ("COPYING "+mapId+" "+targetId+" at "+copyXPos+","+copyYPos+"(Room "+copyRoomId+")");
	// console.log ("PASTING AT "+pasteXPos+","+pasteYPos+"(Room "+pasteRoomId+")");

	// If TIL or undefined.
	if (mapId.toUpperCase() != 'ITM' && mapId.toUpperCase() != 'SPR') {
		if (targetId == 'ANY' || bitsy.room[copyRoomId].tilemap[copyYPos][copyXPos] == targetId) {
			var copyId = bitsy.room[copyRoomId].tilemap[copyYPos][copyXPos];
			drawAt('TIL', copyId, pasteXPos, pasteYPos, pasteRoomId);
		}
	}

	// If ITM or undefined.
	if (mapId.toUpperCase() != 'TIL' && mapId.toUpperCase() != 'SPR') {
		// Iterate backwards through items, to prevent issues with removed indexes
		for (var i = bitsy.room[copyRoomId].items.length - 1; i >= 0; i--) {
			var targetItem = bitsy.room[copyRoomId].items[i];
			if (targetId == 'ANY' || targetId == targetItem.id) {
				if (targetItem.x == copyXPos && targetItem.y == copyYPos) {
					drawAt('ITM', targetItem.id, pasteXPos, pasteYPos, pasteRoomId);
				}
			}
		}
	}

	// If SPR or undefined.
	if (mapId.toUpperCase() != 'TIL' && mapId.toUpperCase() != 'ITM') {
		if (targetId == 'ANY') {
			for (i in bitsy.sprite) {
				if (bitsy.sprite[i].id == 'A') {
					console.log("CAN'T TARGET AVATAR. SKIPPING.");
				} else if (bitsy.sprite[i].room == copyRoomId && bitsy.sprite[i].x == copyXPos && bitsy.sprite[i].y == copyYPos) {
					var copyId = bitsy.sprite[i].id;
					drawAt('SPR', copyId, pasteXPos, pasteYPos, pasteRoomId);
				}
			}
		} else if (bitsy.sprite[targetId] != undefined) {
			if (bitsy.sprite[targetId] != 'A' && bitsy.sprite[targetId].room == copyRoomId && bitsy.sprite[targetId].x == copyXPos && bitsy.sprite[targetId].y == copyYPos) {
				var copyId = bitsy.sprite[targetId].id;
				drawAt('SPR', copyId, pasteXPos, pasteYPos, pasteRoomId);
			}
		}
	}
}

function copyBoxAt(mapId, targetId, x1, y1, x2, y2, copyRoomId, pasteXPos, pasteYPos, pasteRoomId) {
	// Trim and sanitize X and Y Positions, and set relative positions if omitted.
	if (x1 == undefined) {
		x1 = bitsy.player().x;
	} else {
		x1 = x1.toString().trim();
		if (x1 == '') {
			x1 = bitsy.player().x;
		} else if (x1.includes('+')) {
			x1 = bitsy.player().x + parseInt(x1.substring(1), 10);
		} else if (x1.includes('-')) {
			x1 = bitsy.player().x - parseInt(x1.substring(1), 10);
		}
	}
	if (x1 < 0 || x1 > 15) {
		console.log('CLAMPING X1 POSITION. XPOS (' + x1 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		x1 = Math.max(0, Math.min(x1, 15));
	}
	// X2
	if (x2 == undefined) {
		x2 = bitsy.player().x;
	} else {
		x2 = x2.toString().trim();
		if (x2 == '') {
			x2 = bitsy.player().x;
		} else if (x2.includes('+')) {
			x2 = bitsy.player().x + parseInt(x2.substring(1), 10);
		} else if (x2.includes('-')) {
			x2 = bitsy.player().x - parseInt(x2.substring(1), 10);
		}
	}
	if (x2 < 0 || x2 > 15) {
		console.log('CLAMPING X2 POSITION. xPos (' + x2 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		x2 = Math.max(0, Math.min(x2, 15));
	}
	// Y1
	if (y1 == undefined) {
		y1 = bitsy.player().y;
	} else {
		y1 = y1.toString().trim();
		if (y1 == '') {
			y1 = bitsy.player().y;
		} else if (y1.includes('+')) {
			y1 = bitsy.player().y + parseInt(y1.substring(1), 10);
		} else if (y1.includes('-')) {
			y1 = bitsy.player().y - parseInt(y1.substring(1), 10);
		}
	}
	if (y1 < 0 || y1 > 15) {
		console.log('CLAMPING Y1 POSITION. XPOS (' + y1 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		y1 = Math.max(0, Math.min(y1, 15));
	}
	// Y2
	if (y2 == undefined) {
		y2 = bitsy.player().y;
	} else {
		y2 = y2.toString().trim();
		if (y2 == '') {
			y2 = bitsy.player().y;
		} else if (y2.includes('+')) {
			y2 = bitsy.player().y + parseInt(y2.substring(1), 10);
		} else if (y2.includes('-')) {
			y2 = bitsy.player().y - parseInt(y2.substring(1), 10);
		}
	}
	if (y2 < 0 || y2 > 15) {
		console.log('CLAMPING Y2 POSITION. xPos (' + y2 + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		y2 = Math.max(0, Math.min(y2, 15));
	}

	// Trim and sanitize Target Map ID / Type parameter, and use any if not provided.
	if (mapId == undefined) {
		// console.log("TARGET TYPE IS UNDEFINED. DEFAULTING TO ANY (TIL, ITM, OR SPR).");
		mapId = 'ANY';
	} else {
		mapId = mapId.toString().trim();
		if (mapId == '' || !(mapId.toUpperCase() == 'ANY' || mapId.toUpperCase() == 'TIL' || mapId.toUpperCase() == 'ITM' || mapId.toUpperCase() == 'SPR')) {
			// console.log("UNEXPECTED TARGET TYPE ("+mapId+"). DEFAULTING TO ANY (TIL, ITM, OR SPR).");
			mapId = 'ANY';
		}
	}

	// Trim and sanitize Target ID parameter, and use any if not provided
	if (targetId == undefined) {
		// console.log("TARGET ID UNDEFINED. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
		targetId = 'ANY';
	} else {
		targetId = targetId.toString().trim();
		if (targetId == '') {
			// console.log("NO TARGET ID GIVEN. DEFAULTING TO ANY (ANYTHING OF VALID TYPE).");
			targetId = 'ANY';
		}
	}

	if (copyRoomId == undefined) {
		copyRoomId = bitsy.curRoom;
	} else {
		copyRoomId = copyRoomId.toString().trim();
		if (copyRoomId == '') {
			copyRoomId = bitsy.curRoom;
		} else if (bitsy.room[copyRoomId] == undefined) {
			console.log("CAN'T COPY. ROOM ID (" + copyRoomId + ') NOT FOUND.');
			return;
		}
	}

	// Trim and sanitize Paste Position parameters, and set relative positions, even if omitted.
	if (pasteXPos == undefined) {
		pasteXPos = bitsy.player().x;
	} else {
		pasteXPos = pasteXPos.toString().trim();
		if (pasteXPos == '') {
			pasteXPos = bitsy.player().x;
		} else if (pasteXPos.includes('+')) {
			pasteXPos = bitsy.player().x + parseInt(pasteXPos.substring(1), 10);
		} else if (pasteXPos.includes('-')) {
			pasteXPos = bitsy.player().x - parseInt(pasteXPos.substring(1), 10);
		}
	}
	if (pasteXPos < 0 || pasteXPos > 15) {
		console.log("CAN'T PASTE. X POSITION (" + pasteXPos + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		return;
	}

	pasteXPos = parseInt(pasteXPos, 10);


	if (pasteYPos == undefined) {
		pasteYPos = bitsy.player().y;
	} else {
		pasteYPos = pasteYPos.toString().trim();
		if (pasteYPos == '') {
			pasteYPos = bitsy.player().y;
		} else if (pasteYPos.includes('+')) {
			pasteYPos = bitsy.player().y + parseInt(pasteYPos.substring(1), 10);
		} else if (pasteYPos.includes('-')) {
			pasteYPos = bitsy.player().y - parseInt(pasteYPos.substring(1), 10);
		}
	}
	if (pasteYPos < 0 || pasteYPos > 15) {
		console.log("CAN'T PASTE. Y POSITION (" + pasteYPos + ') OUT OF BOUNDS. 0-15 EXPECTED.');
		return;
	}

	pasteYPos = parseInt(pasteYPos, 10);


	if (pasteRoomId == undefined) {
		pasteRoomId = bitsy.curRoom;
	} else {
		pasteRoomId = pasteRoomId.toString().trim();
		if (pasteRoomId == '') {
			pasteRoomId = bitsy.curRoom;
		} else if (bitsy.room[pasteRoomId] == undefined) {
			console.log("CAN'T PASTE. ROOM ID (" + pasteRoomId + ') NOT FOUND.');
			return;
		}
	}

	// Calculate which coordinates are the actual top left and bottom right.
	var topPos = Math.min(y1, y2);
	var leftPos = Math.min(x1, x2);
	var bottomPos = Math.max(y1, y2);
	var rightPos = Math.max(x1, x2);
	var maxXPos = pasteXPos + (rightPos - leftPos);
	var maxYPos = pasteYPos + (bottomPos - topPos);
	var copyIds = [];
	var copyMaps = [];
	var copyXs = [];
	var copyYs = [];

	var colId = -1;
	var rowId = -1;

	// Store maps and ids to copy
	for (var xPos = leftPos; xPos <= rightPos; xPos++) {
		colId = -1;
		rowId++;
		for (var yPos = topPos; yPos <= bottomPos; yPos++) {
			colId++;
			// If TIL or undefined.
			if (mapId.toUpperCase() != 'ITM' && mapId.toUpperCase() != 'SPR') {
				if (targetId == 'ANY' || bitsy.room[copyRoomId].tilemap[yPos][xPos] == targetId) {
					copyIds.push(bitsy.room[copyRoomId].tilemap[yPos][xPos]);
					copyMaps.push('TIL');
					copyXs.push(pasteXPos + rowId);
					copyYs.push(pasteYPos + colId);
				}
			}

			// If ITM or undefined.
			if (mapId.toUpperCase() != 'TIL' && mapId.toUpperCase() != 'SPR') {
				// Iterate backwards through items, to prevent issues with removed indexes
				for (var i = bitsy.room[copyRoomId].items.length - 1; i >= 0; i--) {
					var targetItem = bitsy.room[copyRoomId].items[i];
					if (targetId == 'ANY' || targetId == targetItem.id) {
						if (targetItem.x == xPos && targetItem.y == yPos) {
							copyIds.push(targetItem.id);
							copyMaps.push('ITM');
							copyXs.push(pasteXPos + xPos - 1);
							copyYs.push(pasteYPos + yPos - 1);
						}
					}
				}
			}

			// If SPR or undefined.
			if (mapId.toUpperCase() != 'TIL' && mapId.toUpperCase() != 'ITM') {
				if (targetId == 'ANY') {
					for (i in bitsy.sprite) {
						if (bitsy.sprite[i].id == 'A') {
							console.log("CAN'T TARGET AVATAR. SKIPPING.");
						} else if (bitsy.sprite[i].room == copyRoomId && bitsy.sprite[i].x == xPos && bitsy.sprite[i].y == yPos) {
							copyIds.push(bitsy.sprite[i].id);
							copyMaps.push('SPR');
							copyXs.push(pasteXPos + xPos - 1);
							copyYs.push(pasteYPos + yPos - 1);
						}
					}
				} else if (bitsy.sprite[targetId] != undefined) {
					if (bitsy.sprite[targetId] != 'A' && bitsy.sprite[targetId].room == copyRoomId && bitsy.sprite[targetId].x == xPos && bitsy.sprite[targetId].y == yPos) {
						copyIds.push(bitsy.sprite[i].id);
						copyMaps.push('SPR');
						copyXs.push(pasteXPos + xPos - 1);
						copyYs.push(pasteYPos + yPos - 1);
					}
				}
			}
		}
	}

	// Paste in from copied arrays, at paste position.
	for (var i = 0; i <= copyIds.length; i++) {
		drawAt(copyMaps[i], copyIds[i], copyXs[i], copyYs[i], pasteRoomId);
	}
}

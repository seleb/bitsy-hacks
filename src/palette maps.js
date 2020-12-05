/**
🎨
@file palette maps
@summary allows color pallettes to be defined on a tile-by-tile basis
@license MIT
@version auto
@requires Bitsy Version: 6.1
@author Dana Holdampf

@description
This hack lets you change the color palette, on a tile-by-tile basis.
Each tile can use a different palette's background, tile, sprite, and extra colors.
This can also recolor sprites, changing their palette as they move through a recolored tile.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below, as needed

You can use this hack in 3 main ways:
=====================================
First, you can define a Palette Map for any room, in the hackOptions below.
- A Palette Map is a 16-by-16 grid of Palette IDs, separated by commas.
- This corresponds to what palette each location in that room will be drawn with.
- The Palette Map will override the room's default background, tile color, sprite color, etc.
- Values in the Palette Map correspond to the Palette IDs in your Game Data (0, 1, a, etc.).
- The value "-", or other undefined Palette IDs, will draw using the room's default palette.
- NOTE: The Palette Map recolors everything, including Sprites and Items drawn at that position.

Second, you can put a Palette Override Tag in the name of any tile, sprite, or item.
- By default, this tag is #PAL0, #PAL1, #PALa, etc., but this can be changed below.
- This causes that graphic to always be drawn in the specified Palette's colors.
- Set prioritizePaletteTag to false in the options, to not have tags override a Palette Map.

Third, you can use included dialog commands, to modify the palette of a room or tile.
- NOTE: If you know JS, you can also use the JavaScript Dialog Hack to modify palettes.

-- SETTING ROOM'S DEFAULT PALETTE ------------------------------

{palette "id, room"}
{paletteNow "id, room"}

Information:
- Sets default palette of a room, without changing it's Palette Map.
- This is the normal room palette set in the editor, used by tiles with undefined or empty palette ids.

Parameters:
- id:	The id (letter/number) of the color palette, which will be used as the room's new default palette.
		See the Game Data tab to reference color palette IDs
- room:	The id (number/letter) of the room you're editing the palette map for.
		Leave blank to modify the room the player is currently in.

-- SETTING PALETTE OF A SPECIFIC TILE --------------------------

{tilePalette "id, x, y, room"}
{tilePaletteNow "id, x, y, room"}

Information:
- Changes palette used at a coordinate in a room's Palette Map.
- The Palette Map affects all tiles, items, or sprites at that location.

Parameters:
- id:	The id (number/letter) of the color palette, which will override the palette used at a given position.
		Leave this blank to reset a tile's palette, and revert to the room's palette (still include commas).
		See the Game Data tab to reference color palette IDs
- x, y:	The x and y coordinates of the target tile you want to change the palette of, from 0-15.
		Put + or - before a coordinate to target tiles relative to the player's position. (ex. +10, -2).
		Leave X or Y blank (or use +0) to use the player's current position.
- room:	The id (number/letter) of the room you're editing the palette map for.
		Leave blank to modify the room the player is currently in.

-- RESETTING THE PALETTE OF ALL TILES IN A ROOM ----------------

{resetTilePalette "room"}
{resetTilePaletteNow "room"}

Information:
- Resets the Palette Map of a room back to the values it had to start.
- If the room had no default Palette Map defined in the Hack Options, tiles will be set to none.

Parameters:
- room:	The id (number/letter) of the room you're resetting the palette map for.
		Leave blank to modify the room the player is currently in.

-- CLEARS THE PALETTE MAP FOR ALL TILES IN A ROOM -------------

{clearTilePalette "roomId"}
{clearTilePaletteNow "roomId"}

Information:
- clears Palette Map data for a room, so all tiles use the room's default.

Parameters:
- room:	The id (number/letter) of the room you're resetting the palette map for.
		Leave blank to modify the room the player is currently in.

NOTE: add Now to any command to trigger it mid-dialog. (roomPalNow, tilePalNow, clearPalNow, resetPalNow)

Examples:
{palette "a,0"} sets the default palette for Room 0 to Palette a, once the dialog is done.
{paletteNow "2"} immediately sets the default palette for the current room to Palette 2.
{tilePalette "0,2,4"} sets the Palette Map at coordinates 0,2 in the current room to Palette 0.
{tilePaletteNow "z,0,0,13"} mid-dialog, sets the Palette Map at 0,0 in Room 13 to use Palette z.
{resetPalette "4"} resets Room 4's Palette Map to the palette IDs it had when the game started.
{resetPaletteNow} immediately resets the current room's Palette Map to the value it had at the start.
{clearPalette} removes Palette Map at all coordinates in the current room, so they use the default palette.
{clearPaletteNow "a1"} instantly clears Palette Map for Room a1, so all tiles show the default palette.

This hack is designed to be flexible. Here are some ideas for how to use it!
============================================================================
- By switching palettes from tile to tile, you can effectively use 2 unique colors per tile.
- You can palette-swap, allowing you to reuse the same tile or item in many colors.
- You can recolor areas for visual effects, like differently-lit, smokey, or underwater tiles.
- Using the dialog tags (or JavaScript) you can recolor an area without needing duplicate rooms.
*/
import bitsy from 'bitsy';
import {
	after,
	addDualDialogTag,
} from './helpers/kitsy-script-toolkit';
import { getRelativeNumber } from './helpers/utils';

export var hackOptions = {
	paletteTag: '#PAL',
	// Add this flag to Tile/Sprite/Item Name, followed by a Palette ID (#PAL0, #PALa, etc.)
	// This tile, sprite, or item will automatically be drawn with that palette.
	// By default, this will override the room's default palette and the tile palette map.

	prioritizePaletteTag: true,
	// Whether the Palette Tag above takes priority over a room's Palette Map, when recoloring a graphic.
	// If true, Tile/Sprite/Item always uses the palette defined by it's Palette Tag, ignoring Palette Maps.
	// If false, Tile/Sprite/Item's palette is overridden by a room's Palette Map (whenever not default/"-").

	paletteMapDefinitions: {
		// You can define a Palette Map for any room here. Just copy or edit an element from this list.
		// Each row is a string of Palette IDs, separated by commas. These match the coordinates in the Room.
		// The Palette IDs in the grid are used to draw Tiles/Sprites/Items, instead of the room's default palette.
		// The IDs in the Palette Map match the Palette IDs in your Game Data (0, 1, a, z, etc.)
		// "-", or any ID that doesn't match a Palette ID, use the room's default palette.

		// This is a blank Palette Map for Room ID 0. It can be edited, copied, or removed.
		0: [
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
		],
		// This is a sample Palette Map for Room ID 100. It can be edited, copied, or removed.
		100: [
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,1,0,0,0,0,1,1,1,1,0,0,0,0,1,-',
			'-,0,-,-,-,-,-,-,-,-,-,-,-,-,0,-',
			'-,0,-,-,-,-,-,-,-,-,-,-,-,-,0,-',
			'-,0,-,-,1,1,0,0,1,1,0,0,-,-,0,-',
			'-,0,-,-,1,1,0,0,1,1,0,0,-,-,0,-',
			'-,2,-,-,0,0,1,1,0,0,1,1,-,-,2,-',
			'-,2,-,-,0,0,1,1,0,0,1,1,-,-,2,-',
			'-,2,-,-,1,1,0,0,1,1,0,0,-,-,2,-',
			'-,2,-,-,1,1,0,0,1,1,0,0,-,-,2,-',
			'-,0,-,-,0,0,1,1,0,0,1,1,-,-,0,-',
			'-,0,-,-,0,0,1,1,0,0,1,1,-,-,0,-',
			'-,0,-,-,-,-,-,-,-,-,-,-,-,-,0,-',
			'-,0,-,-,-,-,-,-,-,-,-,-,-,-,0,-',
			'-,1,0,0,0,0,3,3,3,3,0,0,0,0,1,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
		],
		// This is a blank Palette Map for Room ID ZZZ. It can be edited, copied, or removed.
		ZZZ: [
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
			'-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-',
		],
	},
};

// The "default" Palette Map is applied to all rooms that don't have a Palette Map defined.
// Normally each coordinate is set to use the Room's Default Palette using "-", but this can be edited.
// These Palette Maps can be accessed via JS using "paletteMap.roomId[y/row][x/column]"
var defaultMap = new Array(bitsy.mapsize).fill(0).map(function () {
	return new Array(bitsy.mapsize).fill('-');
});
var paletteMap = {};

// Once world is parsed, parse the Palette Map data
after('parseWorld', parsePaletteMaps);

// Do a second pass after drawRoom, to overdraw any tiles that aren't the default palette
after('drawRoom', overdrawRecoloredTiles);

// Implement tags to set a room's Default Palette
addDualDialogTag('palette', function (parameters) {
	var params = parameters[0].split(',');
	setRoomPalette(params[0], params[1]);
});

// Implement tags to modify a room's Palette Map
addDualDialogTag('tilePalette', function (parameters) {
	var params = parameters[0].split(',');
	setPaletteAt(params[0], params[1], params[2], params[3]);
});

// Implement tags to delete a room's Palette Map
addDualDialogTag('clearTilePalette', function (parameters) {
	clearPaletteMap(parameters[0]);
});

// Implement tags to set a reset a room's Palette Map to starting values
addDualDialogTag('resetTilePalette', function (parameters) {
	resetPaletteMap(parameters[0]);
});

function getPaletteOverride(drawing) {
	if (!hackOptions.prioritizePaletteTag) {
		return undefined;
	}
	// Checks if tile/sprite/item's name contains the Palette Override Tag
	if (drawing.name) {
		var paletteId = drawing.name.indexOf(hackOptions.paletteTag);
		if (paletteId !== -1) {
			var p = drawing.name[paletteId + hackOptions.paletteTag.length];

			// TODO: make this not a single character
			// returns single digit/character after palette tag, if a valid palette
			if (bitsy.palette[p] !== undefined) {
				return p;
			}
		}
	}
	return undefined;
}

// TODO: If it's useful, replace this with a function to set every element of a Palette Map to an ID?
function clearPaletteMap(roomId) {
	console.log('Clearing palette map for room "' + roomId + '"');
	paletteMap[roomId] = JSON.parse(JSON.stringify(defaultMap));
}

function resetPaletteMap(roomId) {
	console.log('Resetting palette map for room "' + roomId + '"');

	// If given the Default parameter, resets the Default Map, and Returns.
	if (roomId.toLowerCase() === 'default') {
		clearPaletteMap('default');
		return;
	}

	// If it isn't the Default map, Deep Clone a new Palette Map object from it.
	paletteMap[roomId] = JSON.parse(JSON.stringify(paletteMap.default));

	// If Palette Map for current Room exists in Hack Options, overwrite the new map with this data.
	if (hackOptions.paletteMapDefinitions[roomId]) {
		var newPaletteData = hackOptions.paletteMapDefinitions[roomId];
		for (var y = 0; y < newPaletteData.length; y++) {
			var row = newPaletteData[y].split(',');
			for (var x = 0; x < row.length; x++) {
				var palette = row[x];
				// If Palette ID exists and matches a valid Palette, write it.
				paletteMap[roomId][y][x] = bitsy.palette[palette] ? palette : '-';
			}
		}
	}
}

function parsePaletteMaps() {
	console.log('Parsing palette maps');
	resetPaletteMap('default');
	Object.keys(bitsy.room).forEach(resetPaletteMap); // Initialize Palette Maps for each Room
}

// Trim and sanitize position parameter, and set relative positions
function getPosition(position, axis) {
	var playerPosition = bitsy.player()[axis];
	var p = getRelativeNumber(position, playerPosition);
	if (p < 0 || p > bitsy.mapsize - 1) {
		console.error('Position ' + p + '' + axis + ' out of bounds; 0-' + bitsy.mapsize - 1 + ' expected');
		return undefined;
	}
	return position;
}

// Trim and sanitize Room ID parameter, falling back to current room if omitted
function getRoom(roomId) {
	roomId = (roomId === undefined ? bitsy.curRoom : roomId).toString().trim();
	return bitsy.room[roomId];
}

function setPaletteAt(p, x, y, roomId) {
	x = getPosition(x, 'x');
	y = getPosition(y, 'y');
	var room = getRoom(roomId);

	// Trim and sanitize Room ID parameter, and set to current room if omitted
	if (!room) {
		console.error('Could not set palette: room with id "' + roomId + '" not found');
		return;
	}

	if (p === undefined) {
		p = '-';
	} else if (bitsy.palette[p] === undefined) {
		p = '-';
	}
	console.log('Set palette at ' + x + ',' + y + '(room ' + roomId + ') to ' + p);
	paletteMap[roomId][y][x] = p;
}

function setRoomPalette(paletteId, roomId) {
	var room = getRoom(roomId);
	if (!room) {
		console.error('Could not set palette: room with id "' + roomId + '" not found');
		return;
	}
	var palette = bitsy.palette[paletteId];
	if (!palette) {
		console.error('Could not set palette: invalid palette "' + paletteId + '"');
		return;
	}
	bitsy.room[roomId].pal = paletteId;
}

// get palette from palette map for room at provided position, falling back to current room palette
function getPaletteAt(x, y) {
	x = getPosition(x, 'x');
	y = getPosition(y, 'y');
	var room = paletteMap[bitsy.curRoom];
	var row = room && room[y];
	var col = row && row[x];
	return (col !== '-' && col) || bitsy.getRoom().pal;
}

function overdrawRecoloredTiles(room, context, frameIndex) {
	context = context || bitsy.ctx;

	// protect against invalid rooms
	if (room === undefined) {
		return;
	}
	var paletteId = room.pal || 'default';

	// draw tiles
	for (var y = 0; y < room.tilemap.length; ++y) {
		for (var x = 0; x < room.tilemap[y].length; ++x) {
			var tileTop = y * bitsy.tilesize;
			var tileLeft = x * bitsy.tilesize;
			var tilePaletteId = getPaletteAt(x, y);

			// skip if palette is invalid or default
			if (!bitsy.palette[tilePaletteId] || bitsy.palette[tilePaletteId] === paletteId) {
				continue;
			}
			// draw backgrounds as colored rectangles
			context.fillStyle = 'rgb(' + bitsy.getPal(tilePaletteId)[0].join(',') + ')';
			context.fillRect(tileLeft * bitsy.scale, tileTop * bitsy.scale, (tileLeft + bitsy.tilesize) * bitsy.scale, (tileTop + bitsy.tilesize) * bitsy.scale);

			// skip if tile is empty/invalid
			var id = room.tilemap[y][x];
			if (id === '0' || !bitsy.tile[id]) {
				continue;
			}

			// If a tile has the #PAL tag, it overrides the tile's normal palette.
			tilePaletteId = getPaletteOverride(bitsy.tile[room.tilemap[y][x]]) || tilePaletteId;
			bitsy.drawTile(bitsy.getTileImage(bitsy.tile[id], tilePaletteId, frameIndex), x, y, context);
		}
	}

	// draw items
	for (var i = 0; i < room.items.length; i++) {
		var itm = room.items[i];

		var itemPaletteId = getPaletteAt(itm.x, itm.y);
		// skip if palette is invalid or default
		if (!bitsy.palette[itemPaletteId] || bitsy.palette[itemPaletteId] === paletteId) {
			continue;
		}
		itemPaletteId = getPaletteOverride(bitsy.item[itm.id]) || itemPaletteId;
		bitsy.drawItem(bitsy.getItemImage(bitsy.item[itm.id], itemPaletteId, frameIndex), itm.x, itm.y, context);
	}

	// draw sprites
	Object.values(bitsy.sprite)
		.filter(function (spr) {
			return spr.room === room.id;
		})
		.forEach(function (spr) {
			// Get palette map at sprite's coordinate
			var spritePaletteId = getPaletteAt(spr.x, spr.y);
			// skip if palette is invalid or default
			if (!bitsy.palette[spritePaletteId] || bitsy.palette[spritePaletteId] === paletteId) {
				return;
			}
			spritePaletteId = getPaletteOverride(spr) || spritePaletteId;
			bitsy.drawSprite(bitsy.getSpriteImage(spr, spritePaletteId, frameIndex), spr.x, spr.y, context);
		});
}

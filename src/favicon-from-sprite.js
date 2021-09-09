/**
🌐
@file favicon-from-sprite
@summary generate a browser favicon (tab icon) from a Bitsy sprite, including animation!
@license WTFPL (do WTF you want)
@version auto
@requires Bitsy Version: 5.5
@author @mildmojo

@description
Use one of your game sprites as the page favicon. It'll even animate if the
sprite has multiple frames!

HOW TO USE:
  1. Copy-paste this script into a new script tag after the Bitsy source code.
  2. Edit the configuration below to set which sprite and colors this mod
     should use for the favicon. By default, it will render the player avatar
     sprite in the first available palette's colors.
*/

import bitsy from 'bitsy';
import {
	after,
} from './helpers/kitsy-script-toolkit';
import {
	getImage,
} from './helpers/utils';

// CONFIGURATION FOR FAVICON
export var hackOptions = {
	SPRITE_NAME: '', // Sprite name as entered in editor (not case-sensitive). Defaults to player avatar.
	PALETTE_ID: 0, // Palette name or number to draw colors from. (Names not case-sensitive.)
	BG_COLOR_NUM: 0, // Favicon background color in palette. 0 = BG, 1 = Tile, 2 = Sprite.
	FG_COLOR_NUM: 2, // Favicon sprite color in palette. 0 = BG, 1 = Tile, 2 = Sprite.
	PIXEL_PADDING: 1, // Padding around sprite, in Bitsy pixel units.
	ROUNDED_CORNERS: true, // Should the favicon have rounded corners? (Suggest margin 2px if rounding.)
	FRAME_DELAY: 400, // Frame change interval (ms) if sprite is animated. Use `Infinity` to disable.
};
// END CONFIG

var FAVICON_SIZE = 16; // pixels
var ONE_PIXEL_SCALED = FAVICON_SIZE / bitsy.tilesize;
hackOptions.PIXEL_PADDING *= ONE_PIXEL_SCALED;
var canvas = document.createElement('canvas');
canvas.width = FAVICON_SIZE + 2 * hackOptions.PIXEL_PADDING;
canvas.height = FAVICON_SIZE + 2 * hackOptions.PIXEL_PADDING;
var ctx = canvas.getContext('2d');
var faviconLinkElem;
var faviconFrameURLs = [];
var isStarted = false;

after('load_game', function () {
	if (isStarted) {
		return;
	}
	isStarted = true;

	var frameNum = 0;
	var frames = getFrames(hackOptions.SPRITE_NAME);

	faviconFrameURLs = frames.map(drawFrame);

	// Only one frame? Don't even bother with the loop, just paint the icon once.
	if (frames.length === 1) {
		updateBrowserFavicon(faviconFrameURLs[0]);
		return;
	}

	setInterval(function () {
		frameNum = ++frameNum % frames.length;
		updateBrowserFavicon(faviconFrameURLs[frameNum]);
	}, hackOptions.FRAME_DELAY);
});

function drawFrame(frameData) {
	var pal = getPalette(hackOptions.PALETTE_ID);
	var bgColor = (pal && pal[hackOptions.BG_COLOR_NUM]) || [20, 20, 20];
	var spriteColor = (pal && pal[hackOptions.FG_COLOR_NUM]) || [245, 245, 245];
	var roundingOffset = hackOptions.ROUNDED_CORNERS ? ONE_PIXEL_SCALED : 0;

	// Approximate a squircle-shaped background by drawing a fat plus sign with
	// two overlapping rects, leaving some empty pixels in the corners.
	var longSide = FAVICON_SIZE + 2 * hackOptions.PIXEL_PADDING;
	var shortSide = longSide - roundingOffset * ONE_PIXEL_SCALED;
	ctx.fillStyle = rgb(bgColor);
	ctx.fillRect(roundingOffset,
		0,
		shortSide,
		longSide);
	ctx.fillRect(0,
		roundingOffset,
		longSide,
		shortSide);

	// Draw sprite foreground.
	ctx.fillStyle = rgb(spriteColor);
	Object.keys(frameData).forEach(function (y) {
		Object.keys(frameData).forEach(function (x) {
			if (frameData[y][x] === 1) {
				ctx.fillRect(x * ONE_PIXEL_SCALED + hackOptions.PIXEL_PADDING,
					y * ONE_PIXEL_SCALED + hackOptions.PIXEL_PADDING,
					ONE_PIXEL_SCALED,
					ONE_PIXEL_SCALED);
			}
		});
	});

	return canvas.toDataURL('image/x-icon');
}

function updateBrowserFavicon(dataURL) {
	// Add or modify favicon link tag in document.
	faviconLinkElem = faviconLinkElem || document.querySelector('#favicon');
	if (!faviconLinkElem) {
		faviconLinkElem = document.createElement('link');
		faviconLinkElem.id = 'favicon';
		faviconLinkElem.type = 'image/x-icon';
		faviconLinkElem.rel = 'shortcut icon';
		document.head.appendChild(faviconLinkElem);
	}
	faviconLinkElem.href = dataURL;
}

function getFrames(spriteName) {
	var frames = bitsy.renderer.GetDrawingSource(getImage(spriteName || bitsy.playerId, bitsy.sprite).drw);
	return frames;
}

function getPalette(id) {
	var palId = id;

	if (Number.isNaN(Number(palId))) {
		// Search palettes by name. `palette` is an object with numbers as keys. Yuck.
		// Palette names are case-insensitive to avoid Bitsydev headaches.
		palId = Object.keys(bitsy.palette).find(function (i) {
			return bitsy.palette[i].name && bitsy.palette[i].name.toLowerCase() === palId.toLowerCase();
		});
	}

	return bitsy.getPal(palId);
}

// Expects values = [r, g, b]
function rgb(values) {
	return 'rgb(' + values.join(',') + ')';
}

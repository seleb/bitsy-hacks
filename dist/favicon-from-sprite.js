/**
🌐
@file favicon-from-sprite
@summary generate a browser favicon (tab icon) from a Bitsy sprite, including animation!
@license WTFPL (do WTF you want)
@version 3.0.4
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
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	SPRITE_NAME: '', // Sprite name as entered in editor (not case-sensitive). Defaults to player avatar.
	PALETTE_ID: 0, // Palette name or number to draw colors from. (Names not case-sensitive.)
	BG_COLOR_NUM: 0, // Favicon background color in palette. 0 = BG, 1 = Tile, 2 = Sprite.
	FG_COLOR_NUM: 2, // Favicon sprite color in palette. 0 = BG, 1 = Tile, 2 = Sprite.
	PIXEL_PADDING: 1, // Padding around sprite, in Bitsy pixel units.
	ROUNDED_CORNERS: true, // Should the favicon have rounded corners? (Suggest margin 2px if rounding.)
	FRAME_DELAY: 400, // Frame change interval (ms) if sprite is animated. Use `Infinity` to disable.
};

bitsy = bitsy && bitsy.hasOwnProperty('default') ? bitsy['default'] : bitsy;

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
*/

/*
Helper used to replace code in a script tag based on a search regex
To inject code without erasing original string, using capturing groups; e.g.
	inject(/(some string)/,'injected before $1 injected after')
*/
function inject(searchRegex, replaceString) {
	// find the relevant script tag
	var scriptTags = document.getElementsByTagName('script');
	var scriptTag;
	var code;
	for (var i = 0; i < scriptTags.length; ++i) {
		scriptTag = scriptTags[i];
		var matchesSearch = scriptTag.textContent.search(searchRegex) !== -1;
		var isCurrentScript = scriptTag === document.currentScript;
		if (matchesSearch && !isCurrentScript) {
			code = scriptTag.textContent;
			break;
		}
	}

	// error-handling
	if (!code) {
		throw 'Couldn\'t find "' + searchRegex + '" in script tags';
	}

	// modify the content
	code = code.replace(searchRegex, replaceString);

	// replace the old script tag with a new one using our modified code
	var newScriptTag = document.createElement('script');
	newScriptTag.textContent = code;
	scriptTag.insertAdjacentElement('afterend', newScriptTag);
	scriptTag.remove();
}

/*
Helper for getting image by name or id

Args:
	name: id or name of image to return
	 map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: the image in the given map with the given name/id
 */
function getImage(name, map) {
	var id = Object.prototype.hasOwnProperty.call(map, name) ? name : Object.keys(map).find(function (e) {
		return map[e].name == name;
	});
	return map[id];
}

/**
 * Helper for getting an array with unique elements 
 * @param  {Array} array Original array
 * @return {Array}       Copy of array, excluding duplicates
 */
function unique(array) {
	return array.filter(function (item, idx) {
		return array.indexOf(item) === idx;
	});
}

/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@version 4.0.1
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
HOW TO USE:
  import {before, after, inject, addDialogTag, addDeferredDialogTag} from "./helpers/kitsy-script-toolkit";

  before(targetFuncName, beforeFn);
  after(targetFuncName, afterFn);
  inject(searchRegex, replaceString);
  addDialogTag(tagName, dialogFn);
  addDeferredDialogTag(tagName, dialogFn);

  For more info, see the documentation at:
  https://github.com/seleb/bitsy-hacks/wiki/Coding-with-kitsy
*/

// Ex: after('load_game', function run() { alert('Loaded!'); });
function after(targetFuncName, afterFn) {
	var kitsy = kitsyInit();
	kitsy.queuedAfterScripts[targetFuncName] = kitsy.queuedAfterScripts[targetFuncName] || [];
	kitsy.queuedAfterScripts[targetFuncName].push(afterFn);
}

function kitsyInit() {
	// return already-initialized kitsy
	if (bitsy.kitsy) {
		return bitsy.kitsy;
	}

	// Initialize kitsy
	bitsy.kitsy = {
		queuedInjectScripts: [],
		queuedBeforeScripts: {},
		queuedAfterScripts: {}
	};

	var oldStartFunc = bitsy.startExportedGame;
	bitsy.startExportedGame = function doAllInjections() {
		// Only do this once.
		bitsy.startExportedGame = oldStartFunc;

		// Rewrite scripts and hook everything up.
		doInjects();
		applyAllHooks();

		// Start the game
		bitsy.startExportedGame.apply(this, arguments);
	};

	return bitsy.kitsy;
}


function doInjects() {
	bitsy.kitsy.queuedInjectScripts.forEach(function (injectScript) {
		inject(injectScript.searchRegex, injectScript.replaceString);
	});
	_reinitEngine();
}

function applyAllHooks() {
	var allHooks = unique(Object.keys(bitsy.kitsy.queuedBeforeScripts).concat(Object.keys(bitsy.kitsy.queuedAfterScripts)));
	allHooks.forEach(applyHook);
}

function applyHook(functionName) {
	var functionNameSegments = functionName.split('.');
	var obj = bitsy;
	while (functionNameSegments.length > 1) {
		obj = obj[functionNameSegments.shift()];
	}
	var lastSegment = functionNameSegments[0];
	var superFn = obj[lastSegment];
	var superFnLength = superFn ? superFn.length : 0;
	var functions = [];
	// start with befores
	functions = functions.concat(bitsy.kitsy.queuedBeforeScripts[functionName] || []);
	// then original
	if (superFn) {
		functions.push(superFn);
	}
	// then afters
	functions = functions.concat(bitsy.kitsy.queuedAfterScripts[functionName] || []);

	// overwrite original with one which will call each in order
	obj[lastSegment] = function () {
		var returnVal;
		var args = [].slice.call(arguments);
		var i = 0;

		function runBefore() {
			// All outta functions? Finish
			if (i === functions.length) {
				return returnVal;
			}

			// Update args if provided.
			if (arguments.length > 0) {
				args = [].slice.call(arguments);
			}

			if (functions[i].length > superFnLength) {
				// Assume funcs that accept more args than the original are
				// async and accept a callback as an additional argument.
				return functions[i++].apply(this, args.concat(runBefore.bind(this)));
			} else {
				// run synchronously
				returnVal = functions[i++].apply(this, args);
				if (returnVal && returnVal.length) {
					args = returnVal;
				}
				return runBefore.apply(this, args);
			}
		}

		return runBefore.apply(this, arguments);
	};
}

function _reinitEngine() {
	// recreate the script and dialog objects so that they'll be
	// referencing the code with injections instead of the original
	bitsy.scriptModule = new bitsy.Script();
	bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();

	bitsy.dialogModule = new bitsy.Dialog();
	bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
	bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();
}



// CONFIGURATION FOR FAVICON

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
	for (var y in frameData) {
		if (Object.prototype.hasOwnProperty.call(frameData, y)) {
			for (var x in frameData[y]) {
				if (Object.prototype.hasOwnProperty.call(frameData[y], x)) {
					if (frameData[y][x] === 1) {
						ctx.fillRect(x * ONE_PIXEL_SCALED + hackOptions.PIXEL_PADDING,
							y * ONE_PIXEL_SCALED + hackOptions.PIXEL_PADDING,
							ONE_PIXEL_SCALED,
							ONE_PIXEL_SCALED);
					}
				}
			}
		}
	}

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
	var frames = bitsy.renderer.GetImageSource(getImage(spriteName || bitsy.playerId, bitsy.sprite).drw);
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

exports.hackOptions = hackOptions;

}(this.hacks['favicon-from-sprite'] = this.hacks['favicon-from-sprite'] || {}, window));

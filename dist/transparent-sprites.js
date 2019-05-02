/**
🏁
@file transparent sprites
@summary makes all sprites have transparent backgrounds
@license MIT
@version 3.0.2
@requires Bitsy Version: 5.5
@author Sean S. LeBlanc

@description
Makes all sprites have transparent backgrounds.
i.e. tiles can be seen underneath the player, sprites, and items.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
this.hacks = this.hacks || {};
this.hacks.transparent_sprites = (function (exports,bitsy) {
'use strict';
var hackOptions = {
	isTransparent: function (drawing) {
		//return drawing.name == 'tea'; // specific transparent drawing
		//return ['tea', 'flower', 'hat'].indexOf(drawing.name) !== -1; // specific transparent drawing list
		//return drawing.name.indexOf('TRANSPARENT') !== -1; // transparent drawing flag in name
		return true; // all drawings are transparent
	},
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
@version 4.0.0
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

// Ex: before('load_game', function run() { alert('Loading!'); });
//     before('show_text', function run(text) { return text.toUpperCase(); });
//     before('show_text', function run(text, done) { done(text.toUpperCase()); });
function before(targetFuncName, beforeFn) {
	var kitsy = kitsyInit();
	kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
	kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
}

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
		var args;
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





// override renderer.GetImage to create + cache
// and always give it the player to prevent it from drawing the original assets
var imgToDraw;
var imgCache = {};
before('renderer.GetImage', function (drawing, paletteId, frameOverride) {
	var returnVal = [window.player(), 0]; // consistent bitsy getter to reduce rendering costs

	// check cache first
	var cache = imgCache[drawing.drw] = imgCache[drawing.drw] || {};
	var p = cache[paletteId] = cache[paletteId] || {};
	var frameIndex = frameOverride || drawing.animation.frameIndex;
	imgToDraw = p[frameIndex];
	if (imgToDraw) {
		return returnVal;
	}

	// get the vars we need
	var alpha = hackOptions.isTransparent(drawing) ? 0 : 255;
	var bg = bitsy.getPal(paletteId)[0];
	var col = bitsy.getPal(paletteId)[drawing.col];
	var imageSource = bitsy.renderer.GetImageSource(drawing.drw)[frameIndex];
	var x, y, i, j, pixel, idx;
	var size = bitsy.tilesize * bitsy.scale;

	// give ourselves a little canvas + context to work with
	var spriteCanvas = document.createElement("canvas");
	spriteCanvas.width = size;
	spriteCanvas.height = size;
	var spriteContext = spriteCanvas.getContext("2d");
	var img = spriteContext.createImageData(size, size);

	// create image data
	for (y = 0; y < bitsy.tilesize; ++y) {
		for (x = 0; x < bitsy.tilesize; ++x) {
			pixel = !!imageSource[y][x];
			for (i = 0; i < bitsy.scale; ++i) {
				for (j = 0; j < bitsy.scale; ++j) {
					idx = ((x * bitsy.scale + j) + (y * bitsy.scale + i) * size) * 4;
					img.data[idx] = pixel ? col[0] : bg[0];
					img.data[idx + 1] = pixel ? col[1] : bg[1];
					img.data[idx + 2] = pixel ? col[2] : bg[2];
					img.data[idx + 3] = pixel ? 255 : alpha;
				}
			}
		}
	}

	// put data to our canvas
	spriteContext.clearRect(0, 0, size, size);
	spriteContext.putImageData(img, 0, 0);
	document.body.appendChild(spriteCanvas);

	// save it in our cache
	imgToDraw = p[frameIndex] = spriteCanvas;
	return imgToDraw;
});
// return our custom image instead of the original image data
after('renderer.GetImage', function () {
	return imgToDraw;
});

// override drawTile to draw from our custom image cache
// and give it a mock context to prevent the original drawing
var mockContext = {
	putImageData: function () {},
};
before('drawTile', function (img, x, y, context) {
	if (!context) { //optional pass in context; otherwise, use default
		context = bitsy.ctx;
	}
	// draw our custom image
	context.drawImage(img, x * bitsy.tilesize * bitsy.scale, y * bitsy.tilesize * bitsy.scale);
	// prevent bitsy from drawing
	return [img, x, y, mockContext];
});

exports.hackOptions = hackOptions;

return exports;

}({},window));

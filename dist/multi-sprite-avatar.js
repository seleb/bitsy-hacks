/**
👨‍👨‍👧‍👧
@file multi-sprite avatar
@summary make the player big
@license MIT
@version 15.4.1
@author Sean S. LeBlanc

@description
Allows multiple sprites to be moved together along with the player
to create the illusion of a larger avatar.

Provided example is a 2x2 square for simplicity,
but multi-sprite avatar's shape can be arbitrary.

Notes:
- will probably break any other hacks involving moving other sprites around (they'll probably use the player's modified collision)
- the original avatar sprite isn't changed, but will be covered by a piece at x:0,y:0
- make sure not to include the original avatar sprite in the pieces list (this will cause the syncing to remove the player from the game)

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit `pieces` below to customize the multi-sprite avatar
	Pieces must have an x,y offset and a sprite id
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	pieces: [{
		x: 0,
		y: 0,
		spr: 'c',
	}, {
		x: 1,
		y: 0,
		spr: 'd',
	}, {
		x: 0,
		y: 1,
		spr: 'e',
	}, {
		x: 1,
		y: 1,
		spr: 'f',
	}],
	enabledOnStart: true,
};

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

bitsy = bitsy || /*#__PURE__*/_interopDefaultLegacy(bitsy);

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
		throw new Error('Couldn\'t find "' + searchRegex + '" in script tags');
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
		return map[e].name === name;
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
		queuedAfterScripts: {},
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
	reinitEngine();
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
			}
			// run synchronously
			returnVal = functions[i++].apply(this, args);
			if (returnVal && returnVal.length) {
				args = returnVal;
			}
			return runBefore.apply(this, args);
		}

		return runBefore.apply(this, arguments);
	};
}

function reinitEngine() {
	// recreate the script and dialog objects so that they'll be
	// referencing the code with injections instead of the original
	bitsy.scriptModule = new bitsy.Script();
	bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();

	bitsy.dialogModule = new bitsy.Dialog();
	bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
	bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();
}





if (hackOptions.enabledOnStart) {
	after('onready', enableBig);
}

var enabled = false;
var pieces = [];

function syncPieces() {
	var p = bitsy.player();
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		var spr = getImage(piece.spr, bitsy.sprite);

		spr.room = p.room;
		spr.x = p.x + piece.x;
		spr.y = p.y + piece.y;
	}
}

function enableBig(newPieces) {
	disableBig();
	pieces = newPieces || hackOptions.pieces;
	enabled = true;
	syncPieces();
}

function disableBig() {
	enabled = false;
	for (var i = 0; i < pieces.length; ++i) {
		getImage(pieces[i].spr, bitsy.sprite).room = null;
	}
}

// handle item/ending/exit collision
var originalGetItemIndex = bitsy.getItemIndex;
var originalGetEnding = bitsy.getEnding;
var originalGetExit = bitsy.getExit;
var getItemIndexOverride = function (roomId, x, y) {
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		var idx = originalGetItemIndex(roomId, x + piece.x, y + piece.y);
		if (idx !== -1) {
			return idx;
		}
	}
	return -1;
};
var getEndingOverride = function (roomId, x, y) {
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		var e = originalGetEnding(roomId, x + piece.x, y + piece.y);
		if (e) {
			return e;
		}
	}
	return undefined;
};
var getExitOverride = function (roomId, x, y) {
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		var e = originalGetExit(roomId, x + piece.x, y + piece.y);
		if (e) {
			return e;
		}
	}
	return undefined;
};
before('movePlayer', function () {
	if (enabled) {
		bitsy.getItemIndex = getItemIndexOverride;
		bitsy.getEnding = getEndingOverride;
		bitsy.getExit = getExitOverride;
	}
});
after('movePlayer', function () {
	bitsy.getItemIndex = originalGetItemIndex;
	bitsy.getEnding = originalGetEnding;
	bitsy.getExit = originalGetExit;
	if (enabled) {
		syncPieces();
	}
});

// handle wall/sprite collision
function repeat(fn) {
	var p = bitsy.player();
	var x = p.x;
	var y = p.y;
	var r;
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		p.x = x + piece.x;
		p.y = y + piece.y;
		r = r || fn();
	}
	p.x = x;
	p.y = y;
	return r;
}
var repeats = [
	'getSpriteLeft',
	'getSpriteRight',
	'getSpriteUp',
	'getSpriteDown',
	'isWallLeft',
	'isWallRight',
	'isWallUp',
	'isWallDown',
];

// prevent player from colliding with their own pieces
function filterPieces(id) {
	for (var i = 0; i < pieces.length; ++i) {
		if (id === pieces[i].spr || (bitsy.sprite[id] && bitsy.sprite[id].name === pieces[i].spr)) {
			return null;
		}
	}
	return id;
}

after('startExportedGame', function () {
	for (var i = 0; i < repeats.length; ++i) {
		var r = repeats[i];
		var originalFn = bitsy[r];
		// eslint-disable-next-line no-loop-func
		bitsy[r] = function (fn) {
			return enabled ? repeat(fn) : fn();
		}.bind(undefined, originalFn);
	}
	var originalGetSpriteAt = bitsy.getSpriteAt;
	bitsy.getSpriteAt = function () {
		return filterPieces(originalGetSpriteAt.apply(this, arguments));
	};
});

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

}(this.hacks['multi-sprite_avatar'] = this.hacks['multi-sprite_avatar'] || {}, window));

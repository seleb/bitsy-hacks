/**
👨‍👨‍👧‍👧
@file multi-sprite avatar
@summary make the player big
@license MIT
@version 1.0.0
@author Sean S. LeBlanc

@description
Allows multiple sprites to be moved together along with the player
to create the illusion of a larger avatar.

Provided example is a 2x2 square for simplicity,
but multi-sprite avatar's shape can be arbitrary.

Notes:
- will probably break any other hacks involving moving other sprites around (they'll probably use the player's modified collision)
- the original avatar sprite isn't changed, but will be covered by a piece at x:0,y:0

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit `pieces` below to customize the multi-sprite avatar
	Pieces must have an x,y offset and a sprite id
*/
(function (bitsy) {
'use strict';
var hackOptions = {
	pieces: [{
		x: 0,
		y: 0,
		spr: 'c'
	}, {
		x: 1,
		y: 0,
		spr: 'd'
	}, {
		x: 0,
		y: 1,
		spr: 'e'
	}, {
		x: 1,
		y: 1,
		spr: 'f'
	}],
	enabledOnStart: true
};

bitsy = bitsy && bitsy.hasOwnProperty('default') ? bitsy['default'] : bitsy;

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
*/

/*helper used to inject code into script tags based on a search string*/
function inject(searchString, codeToInject) {
	var args = [].slice.call(arguments);
	codeToInject = flatten(args.slice(1)).join('');

	// find the relevant script tag
	var scriptTags = document.getElementsByTagName('script');
	var scriptTag;
	var code;
	for (var i = 0; i < scriptTags.length; ++i) {
		scriptTag = scriptTags[i];
		var matchesSearch = scriptTag.textContent.indexOf(searchString) !== -1;
		var isCurrentScript = scriptTag === document.currentScript;
		if (matchesSearch && !isCurrentScript) {
			code = scriptTag.textContent;
			break;
		}
	}

	// error-handling
	if (!code) {
		throw 'Couldn\'t find "' + searchString + '" in script tags';
	}

	// modify the content
	code = code.replace(searchString, searchString + codeToInject);

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

function flatten(list) {
	if (!Array.isArray(list)) {
		return list;
	}

	return list.reduce(function (fragments, arg) {
		return fragments.concat(flatten(arg));
	}, []);
}

/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@version 2.1.1
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
HOW TO USE:
  import {before, after, inject, addDialogTag, addDeferredDialogTag} from "./helpers/kitsy-script-toolkit";

  before(targetFuncName, beforeFn);
  after(targetFuncName, afterFn);
  inject(searchString, codeFragment1[, ...codefragmentN]);
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
		inject(injectScript.searchString, injectScript.codeFragments);
	});
	_reinitEngine();
}

function applyAllHooks() {
	var allHooks = unique(Object.keys(bitsy.kitsy.queuedBeforeScripts).concat(Object.keys(bitsy.kitsy.queuedAfterScripts)));
	allHooks.forEach(applyHook);
}

function applyHook(functionName) {
	var superFn = bitsy[functionName];
	var superFnLength = superFn.length;
	var functions = [];
	// start with befores
	functions = functions.concat(bitsy.kitsy.queuedBeforeScripts[functionName] || []);
	// then original
	functions.push(superFn);
	// then afters
	functions = functions.concat(bitsy.kitsy.queuedAfterScripts[functionName] || []);

	// overwrite original with one which will call each in order
	bitsy[functionName] = function () {
		var args = [].slice.call(arguments);
		var i = 0;
		runBefore.apply(this, arguments);

		// Iterate thru sync & async functions. Run each, finally run original.
		function runBefore() {
			// All outta functions? Finish
			if (i === functions.length) {
				return;
			}

			// Update args if provided.
			if (arguments.length > 0) {
				args = [].slice.call(arguments);
			}

			if (functions[i].length > superFnLength) {
				// Assume funcs that accept more args than the original are
				// async and accept a callback as an additional argument.
				functions[i++].apply(this, args.concat(runBefore.bind(this)));
			} else {
				// run synchronously
				var newArgs = functions[i++].apply(this, args) || args;
				runBefore.apply(this, newArgs);
			}
		}
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





if (hackOptions.enabledOnStart) {
	after("onready", enableBig);
}

var enabled = false;
var pieces = [];

function syncPieces() {
	var p = bitsy.player();
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		var spr = bitsy.sprite[piece.spr];

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
		bitsy.sprite[pieces[i].spr].room = null;
	}
}

// handle item/ending/exit collision
var _getItemIndex = bitsy.getItemIndex;
var _getEnding = bitsy.getEnding;
var _getExit = bitsy.getExit;
var getItemIndexOverride = function (roomId, x, y) {
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		var idx = _getItemIndex(roomId, x + piece.x, y + piece.y);
		if (idx !== -1) {
			return idx;
		}
	}
	return -1;
};
var getEndingOverride = function (roomId, x, y) {
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		var e = _getEnding(roomId, x + piece.x, y + piece.y);
		if (e) {
			return e;
		}
	}
};
var getExitOverride = function (roomId, x, y) {
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		var e = _getExit(roomId, x + piece.x, y + piece.y);
		if (e) {
			return e;
		}
	}
};
before("movePlayer", function () {
	if (enabled) {
		bitsy.getItemIndex = getItemIndexOverride;
		bitsy.getEnding = getEndingOverride;
		bitsy.getExit = getExitOverride;
	}
});
after("movePlayer", function () {
	bitsy.getItemIndex = _getItemIndex;
	bitsy.getEnding = _getEnding;
	bitsy.getExit = _getExit;
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
	'isWallDown'
];
for (var i = 0; i < repeats.length; ++i) {
	var r = repeats[i];
	var _fn = bitsy[r];
	bitsy[r] = function (fn) {
		return enabled ? repeat(fn) : fn();
	}.bind(undefined, _fn);
}

// prevent player from colliding with their own pieces
function filterPieces(id) {
	for (var i = 0; i < pieces.length; ++i) {
		if (id === pieces[i].spr) {
			return null;
		}
	}
	return id;
}
var _getSpriteAt = bitsy.getSpriteAt;
bitsy.getSpriteAt = function () {
	return filterPieces(_getSpriteAt.apply(this, arguments));
};

}(window));

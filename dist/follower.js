/**
💕
@file follower
@summary makes a single sprite follow the player
@license MIT
@version 2.1.1
@author Sean S. LeBlanc

@description
Makes a single sprite follow the player.
Bitsy has a "walkingPath" built into the sprite system (I think this is a hold-over from the old pathfinding mouse controls).
Paths can be assigned to any sprite to create different AI behaviours. 

Includes an optional feature which filters the follower out of collisions.

Known issues:
- if the player uses an exit that puts them on top of another exit, the follower walks through the second exit.
- the follower will warp to the player on the first movement. This can be avoided by placing them next to the player in bitsy.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit `follower` to your intended sprite
*/
this.hacks = this.hacks || {};
this.hacks.follower = (function (exports,bitsy) {
'use strict';
var hackOptions = {
	allowFollowerCollision: false, // if true, the player can walk into the follower and talk to them (possible to get stuck this way)
	follower: 'a' // id or name of sprite to be the follower
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
	var id = map.hasOwnProperty(name) ? name : Object.keys(map).find(function (e) {
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





var follower;
after('startExportedGame', function () {
	follower = getImage(hackOptions.follower, bitsy.sprite);

	// remove + add player to sprite list to force rendering them on top of follower
	var p = bitsy.sprite[bitsy.playerId];
	delete bitsy.sprite[bitsy.playerId];
	bitsy.sprite[bitsy.playerId] = p;

	lastRoom = bitsy.player().room;
});

var lastRoom;
after('onPlayerMoved', function () {
	// detect room change
	if (lastRoom !== bitsy.player().room) {
		// on room change, warp to player
		lastRoom = follower.room = bitsy.player().room;
		follower.x = bitsy.player().x;
		follower.y = bitsy.player().y;
		follower.walkingPath.length = 0;
	} else {
		var step = {
			x: bitsy.player().x,
			y: bitsy.player().y
		};
		switch (bitsy.curPlayerDirection) {
		case bitsy.Direction.Up:
			step.y += 1;
			break;
		case bitsy.Direction.Down:
			step.y -= 1;
			break;
		case bitsy.Direction.Left:
			step.x += 1;
			break;
		case bitsy.Direction.Right:
			step.x -= 1;
			break;
		default:
			break;
		}
		follower.walkingPath.push(step);
	}
});

function filterFollowing(id) {
	return follower === bitsy.sprite[id] ? null : id;
}
if (!hackOptions.allowFollowerCollision) {
	// filter follower out of collisions
	var _getSpriteLeft = bitsy.getSpriteLeft;
	bitsy.getSpriteLeft = function () {
		return filterFollowing(_getSpriteLeft());
	};
	var _getSpriteRight = bitsy.getSpriteRight;
	bitsy.getSpriteRight = function () {
		return filterFollowing(_getSpriteRight());
	};
	var _getSpriteUp = bitsy.getSpriteUp;
	bitsy.getSpriteUp = function () {
		return filterFollowing(_getSpriteUp());
	};
	var _getSpriteDown = bitsy.getSpriteDown;
	bitsy.getSpriteDown = function () {
		return filterFollowing(_getSpriteDown());
	};
}

exports.hackOptions = hackOptions;

return exports;

}({},window));

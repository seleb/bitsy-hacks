/**
💕
@file follower
@summary makes a single sprite follow the player
@license MIT
@version 3.1.0
@author Sean S. LeBlanc

@description
Makes a single sprite follow the player.
The follower can optionally collide with the player,
and can be changed at runtime with dialog commands.

Usage:
	(follower "followerNameOrId")
	(followerNow "followerNameOrId")
	(followerCollision "true/false")
	(followerDelay "frames")
	(followerDelayNow "frames")
	(followerSync)
	(followerSyncNow)

Examples:
	(follower "a") - the sprite with the id "a" starts following
	(follower "my follower") - the sprite with the name "my follower" starts following
	(follower) - stops a current follower
	(followerCollision "true") - enables follower collision
	(followerCollision "false") - disables follower collision
	(followerDelay "0") - sets follower to move immediately after player
	(followerDelay "200") - sets follower to move at normal speed
	(followerDelay "1000") - sets follower to move once per second
	(followerSync) - moves the follower on top of the player


Known issues:
- Followers will warp to the player on their first movement.
  This can be avoided by placing them next to or on the same tile as the player.
- When collision is enabled, it's possible for the player to get stuck
  between walls and their follower. Make sure to avoid single-tile width
  spaces when using this (or design with that restriction in mind!)

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below to set up an initial follower
3. Use dialog commands as needed
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	allowFollowerCollision: false, // if true, the player can walk into the follower and talk to them (possible to get stuck this way)
	follower: 'a', // id or name of sprite to be the follower; use '' to start without a follower
	delay: 200, // delay between each follower step (0 is immediate, 400 is twice as slow as normal)
};

bitsy = bitsy && Object.prototype.hasOwnProperty.call(bitsy, 'default') ? bitsy['default'] : bitsy;

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


// Ex: inject(/(names.sprite.set\( name, id \);)/, '$1console.dir(names)');
function inject$1(searchRegex, replaceString) {
	var kitsy = kitsyInit();
	kitsy.queuedInjectScripts.push({
		searchRegex: searchRegex,
		replaceString: replaceString
	});
}

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

// Rewrite custom functions' parentheses to curly braces for Bitsy's
// interpreter. Unescape escaped parentheticals, too.
function convertDialogTags(input, tag) {
	return input
		.replace(new RegExp('\\\\?\\((' + tag + '(\\s+(".+?"|.+?))?)\\\\?\\)', 'g'), function (match, group) {
			if (match.substr(0, 1) === '\\') {
				return '(' + group + ')'; // Rewrite \(tag "..."|...\) to (tag "..."|...)
			}
			return '{' + group + '}'; // Rewrite (tag "..."|...) to {tag "..."|...}
		});
}


function addDialogFunction(tag, fn) {
	var kitsy = kitsyInit();
	kitsy.dialogFunctions = kitsy.dialogFunctions || {};
	if (kitsy.dialogFunctions[tag]) {
		throw new Error('The dialog function "' + tag + '" already exists.');
	}

	// Hook into game load and rewrite custom functions in game data to Bitsy format.
	before('parseWorld', function (game_data) {
		return [convertDialogTags(game_data, tag)];
	});

	kitsy.dialogFunctions[tag] = fn;
}

/**
 * Adds a custom dialog tag which executes the provided function.
 * For ease-of-use with the bitsy editor, tags can be written as
 * (tagname "parameters") in addition to the standard {tagname "parameters"}
 * 
 * Function is executed immediately when the tag is reached.
 *
 * @param {string}   tag Name of tag
 * @param {Function} fn  Function to execute, with signature `function(environment, parameters, onReturn){}`
 *                       environment: provides access to SetVariable/GetVariable (among other things, see Environment in the bitsy source for more info)
 *                       parameters: array containing parameters as string in first element (i.e. `parameters[0]`)
 *                       onReturn: function to call with return value (just call `onReturn(null);` at the end of your function if your tag doesn't interact with the logic system)
 */
function addDialogTag(tag, fn) {
	addDialogFunction(tag, fn);
	inject$1(
		/(var functionMap = new Map\(\);)/,
		'$1functionMap.set("' + tag + '", kitsy.dialogFunctions.' + tag + ');'
	);
}

/**
 * Adds a custom dialog tag which executes the provided function.
 * For ease-of-use with the bitsy editor, tags can be written as
 * (tagname "parameters") in addition to the standard {tagname "parameters"}
 * 
 * Function is executed after the dialog box.
 *
 * @param {string}   tag Name of tag
 * @param {Function} fn  Function to execute, with signature `function(environment, parameters){}`
 *                       environment: provides access to SetVariable/GetVariable (among other things, see Environment in the bitsy source for more info)
 *                       parameters: array containing parameters as string in first element (i.e. `parameters[0]`)
 */
function addDeferredDialogTag(tag, fn) {
	addDialogFunction(tag, fn);
	bitsy.kitsy.deferredDialogFunctions = bitsy.kitsy.deferredDialogFunctions || {};
	var deferred = bitsy.kitsy.deferredDialogFunctions[tag] = [];
	inject$1(
		/(var functionMap = new Map\(\);)/,
		'$1functionMap.set("' + tag + '", function(e, p, o){ kitsy.deferredDialogFunctions.' + tag + '.push({e:e,p:p}); o(null); });'
	);
	// Hook into the dialog finish event and execute the actual function
	after('onExitDialog', function () {
		while (deferred.length) {
			var args = deferred.shift();
			bitsy.kitsy.dialogFunctions[tag](args.e, args.p, args.o);
		}
	});
	// Hook into the game reset and make sure data gets cleared
	after('clearGameData', function () {
		deferred.length = 0;
	});
}

/**
 * Adds two custom dialog tags which execute the provided function,
 * one with the provided tagname executed after the dialog box,
 * and one suffixed with 'Now' executed immediately when the tag is reached.
 *
 * i.e. helper for the (exit)/(exitNow) pattern.
 *
 * @param {string}   tag Name of tag
 * @param {Function} fn  Function to execute, with signature `function(environment, parameters){}`
 *                       environment: provides access to SetVariable/GetVariable (among other things, see Environment in the bitsy source for more info)
 *                       parameters: array containing parameters as string in first element (i.e. `parameters[0]`)
 */
function addDualDialogTag(tag, fn) {
	addDialogTag(tag + 'Now', function (environment, parameters, onReturn) {
		fn(environment, parameters);
		onReturn(null);
	});
	addDeferredDialogTag(tag, fn);
}





function setFollower(followerName) {
	exports.follower = followerName && getImage(followerName, bitsy.sprite);
}

after('startExportedGame', function () {
	setFollower(hackOptions.follower);

	// remove + add player to sprite list to force rendering them on top of follower
	var p = bitsy.sprite[bitsy.playerId];
	delete bitsy.sprite[bitsy.playerId];
	bitsy.sprite[bitsy.playerId] = p;
});

let movedFollower = false;
after('onPlayerMoved', function () {
	// skip walking if already moved due to exits
	if (movedFollower) {
		movedFollower = false;
		return;
	}

	if (!exports.follower) {
		return;
	}

	// start at the player's current position (they have already moved)
	var step = {
		x: bitsy.player().x,
		y: bitsy.player().y,
		room: bitsy.player().room,
	};
	// adjust follower to be one step back
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
	}
	exports.follower.walkingPath.push(step);
});

// make follower walk "through" exits
before('movePlayerThroughExit', function (exit) {
	if (exports.follower) {
		movedFollower = true;
		exports.follower.walkingPath.push({
			x: exit.dest.x,
			y: exit.dest.y,
			room: exit.dest.room,
		});
	}
});

// bitsy only uses the walking path for position by default;
// update it to also move through rooms
inject$1(/(spr\.y = nextPos\.y;)/, '$1\nspr.room = nextPos.room || spr.room;');

function filterFollowing(id) {
	return exports.follower === bitsy.sprite[id] ? null : id;
}
// filter follower out of collisions
var originalGetSpriteLeft = bitsy.getSpriteLeft;
bitsy.getSpriteLeft = function () {
	if (!hackOptions.allowFollowerCollision) {
		return filterFollowing(originalGetSpriteLeft());
	}
	return originalGetSpriteLeft();
};
var originalGetSpriteRight = bitsy.getSpriteRight;
bitsy.getSpriteRight = function () {
	if (!hackOptions.allowFollowerCollision) {
		return filterFollowing(originalGetSpriteRight());
	}
	return originalGetSpriteRight();
};
var originalGetSpriteUp = bitsy.getSpriteUp;
bitsy.getSpriteUp = function () {
	if (!hackOptions.allowFollowerCollision) {
		return filterFollowing(originalGetSpriteUp());
	}
	return originalGetSpriteUp();
};
var originalGetSpriteDown = bitsy.getSpriteDown;
bitsy.getSpriteDown = function () {
	if (!hackOptions.allowFollowerCollision) {
		return filterFollowing(originalGetSpriteDown());
	}
	return originalGetSpriteDown();
};

addDualDialogTag('follower', function (environment, parameters) {
	setFollower(parameters[0]);
});
addDialogTag('followerCollision', function (environment, parameters) {
	hackOptions.allowFollowerCollision = parameters[0] !== 'false';
});
addDualDialogTag('followerDelay', function (environment, parameters) {
	hackOptions.delay = parseInt(parameters[0], 10);
});
addDualDialogTag('followerSync', function () {
	if (exports.follower) {
		var player = bitsy.player();
		exports.follower.room = player.room;
		exports.follower.x = player.x;
		exports.follower.y = player.y;
		exports.follower.walkingPath.length = 0;
	}
});

before('moveSprites', function () {
	bitsy.moveCounter -= bitsy.deltaTime; // cancel out default movement delay
	bitsy.moveCounter += bitsy.deltaTime * (200 / hackOptions.delay); // apply movement delay from options
});

exports.hackOptions = hackOptions;

}(this.hacks.follower = this.hacks.follower || {}, window));

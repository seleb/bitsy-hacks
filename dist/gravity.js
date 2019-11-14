/**
🍂
@file gravity
@summary Pseudo-platforming/gravity/physics
@license MIT
@version 1.0.1
@requires 6.3
@author Cole Sea

@description
Overrides Bitsy movement logic to simulate "gravity".

Features
- Treats walls and sprites as "solid" objects that can be stood on
- Does not allow player to move upwards unless they are on a climbable tile or
jump/jetpack/force are activated
- Does not allow player to move horizontally unless they are standing on a
wall or sprite or climbable/standable tile
- Forces player to "fall" any time they are not on a wall or sprite
- Restricts how much the player can move horizontally while falling
- Calculates fall damage any time the player lands on a wall or sprite
- All invalid movement inputs (i.e, moving into a wall, pressing up while falling)
are converted into down presses

Dialog Tags

- (toggleGravity) Toggle gravity on/off
- (setJumpPower NUM) Sets how many tiles the player can move/jump straight up.
Replace NUM with a whole number (setJumpPower 1). JumpPower is refreshed every time
the player lands on the ground.
- (toggleJetpack) Allows player to "jetpack"/jump upwards while already in the air.
Moving upwards still consumes JumpPower, which is only refreshed upon landing.
- (setGravityDirection "DIRECTION") Makes gravity flow in DIRECTION.
Replace DIRECTION with "up", "down", "left", or "right".
- (forceGravity "DIRECTION") Forces the player to move in the given DIRECTION until
they hit something. Replace DIRECTION with "up", "down", "left", or "right".

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit hackOptions below as desired
3. Use the dialog tags in your game to alter settings
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	// Configure whether or not gravity should be active when the game starts.
	// Use the `toggleGravity` dialog tag to turn it on/off
	activeOnLoad: true,

	// Configure how much JumpPower the player has after landing
	// Set this to 1 and player can jump 1 tile high any time they are on the ground
	// Set this to 0 for no jumping/only falling
	// Player can only jump straight up from a solid object, they cannot jump while
	// falling or after moving horizontally unless `jetpack` is active
	jumpPower: 0,

	// If true, then the player can jump while falling/in mid-air
	// Player is still restricted by the amount of JumpPower they have left,
	// which does not replenish until they land on a solid object
	jetpack: false,

	// Configure which tiles are "climbable".
	// Player will be able to move upward while standing on those tiles.
	// Useful for making ladders, ropes, trampolines, etc.
	isClimbable: function (tile) {
		return tile.name && tile.name.indexOf('CLIMB') !== -1; // climbable tile flag in name
		// return tile.name == 'ladder'; // specific climbable tile
		// return ['ladder', 'rope', 'trampoline'].indexOf(tile.name) !== -1; // specific climbable tile list
	},

	// Configure which tiles are "standable".
	// Player will be able to walk horizontally across this tile even if it's not a wall/sprite.
	// Useful for making a ladder/rope that connect to a standable surface at it's top.
	isStandable: function (tile) {
		return tile.name && tile.name.indexOf('STAND') !== -1; // standable tile flag in name
		// return tile.name == 'ledge'; // specific standable tile
		// return ['ledge', 'overhang', 'trapdoor'].indexOf(tile.name) !== -1; // specific standable tile list
	},

	// Sets the direction that gravity initially flows in
	// Can be changed with the `setGravityDirection` dialog tag
	initialGravityDir: 'down',

	// If true, player avatar will be rotated whenever `setGravityDirection` is used
	// TODO: how does this interact with initialGravityDir?
	flipAvatarOnGravityChange: true,

	// Runs any time the player "lands" on something solid,
	// `tilesFallen` is the number of tiles they fell.
	// Grabbing a ladder or using the "jetpack" will reset the fall counter.
	// If you don't want any fall damage, leave this function empty
	// Contains examples for decreasing a variable or ending the game
	landed: function (tilesFallen) {
		console.log('landed', tilesFallen);
		// // Decrease a variable in your game called `health`
		// var health = bitsy.scriptInterpreter.GetVariable('health');
		// bitsy.scriptInterpreter.SetVariable('health', health - tilesFallen);

		// // or maybe just end the game if the fall was high enough?
		// if (tilesFallen > 5) {
		// bitsy.dialogBuffer.EndDialog();
		// bitsy.startNarrating('YOU DIED!', true);
		// }
	},

	// Controls how much the player can move horizontally during a single "fall"
	// For each move in a fall, this ratio must be less than (<) the max:
	// (number of tiles moved horizontally) / (total number of tiles moved)
	// Set this to 0 to be unable to move horizontally while falling
	// Set this to 0.5 and player can move horizontally every other move while falling
	// Set this to 1 to always be able to move horizontally while falling
	maxHorizontalFallingRatio: 0.51,
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

/**
@file transform sprite data
@summary Helpers for flipping and rotating sprite data
*/

// copied from https://stackoverflow.com/a/46805290
function transpose(matrix) {
	const rows = matrix.length,
		cols = matrix[0].length;
	const grid = [];
	for (let j = 0; j < cols; j++) {
		grid[j] = Array(rows);
	}
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			grid[j][i] = matrix[i][j];
		}
	}
	return grid;
}

// helper function to flip sprite data
function transformSpriteData(spriteData, v, h, rot) {
	var x, y, x2, y2, col, tmp;
	var s = spriteData.slice();
	if (v) {
		for (y = 0; y < s.length / 2; ++y) {
			y2 = s.length - y - 1;
			tmp = s[y];
			s[y] = s[y2];
			s[y2] = tmp;
		}
	}
	if (h) {
		for (y = 0; y < s.length; ++y) {
			col = s[y] = s[y].slice();
			for (x = 0; x < col.length / 2; ++x) {
				x2 = col.length - x - 1;
				tmp = col[x];
				col[x] = col[x2];
				col[x2] = tmp;
			}
		}
	}
	if (rot) {
		s = transpose(s);
	}
	return s;
}

/**
@file edit image at runtime
@summary API for updating image data at runtime.
@author Sean S. LeBlanc
@description
Adds API for updating sprite, tile, and item data at runtime.

Individual frames of image data in bitsy are 8x8 1-bit 2D arrays in yx order
e.g. the default player is:
[
	[0,0,0,1,1,0,0,0],
	[0,0,0,1,1,0,0,0],
	[0,0,0,1,1,0,0,0],
	[0,0,1,1,1,1,0,0],
	[0,1,1,1,1,1,1,0],
	[1,0,1,1,1,1,0,1],
	[0,0,1,0,0,1,0,0],
	[0,0,1,0,0,1,0,0]
]
*/

/*
Args:
	   id: string id or name
	frame: animation frame (0 or 1)
	  map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: a single frame of a image data
*/
function getImageData(id, frame, map) {
	return bitsy.renderer.GetImageSource(getImage(id, map).drw)[frame];
}

function getSpriteData(id, frame) {
	return getImageData(id, frame, bitsy.sprite);
}

/*
Updates a single frame of image data

Args:
	     id: string id or name
	  frame: animation frame (0 or 1)
	    map: map of images (e.g. `sprite`, `tile`, `item`)
	newData: new data to write to the image data
*/
function setImageData(id, frame, map, newData) {
	var drawing = getImage(id, map);
	var drw = drawing.drw;
	var img = bitsy.renderer.GetImageSource(drw).slice();
	img[frame] = newData;
	bitsy.renderer.SetImageSource(drw, img);
}

function setSpriteData(id, frame, newData) {
	setImageData(id, frame, bitsy.sprite, newData);
}






var active = hackOptions.activeOnLoad;
var wasStandingOnSomething = false;
var wasClimbing = false; //
var isOnClimbableTile = false; //
var isClimbing = false; //
var fallCounter = 0; // how many tiles player has been falling for
var horizontalFallingMoves = 0; // how many times player has moved horizontally during current fall
var gravityDir = hackOptions.initialGravityDir; // which arrow key does the user press to move downward relative to gravity
var lastMoveMapped = 'down'; // last direction that the player moved in (relative to gravity)
var forceGravityDir; // if played is being forced, this is the direction they are being pushed in
var wasJetpacking = false; // whether or not player used any jumpPower on their last move
var jumpPower = hackOptions.jumpPower; // how many tiles the player can jump upwards
var jetpack = hackOptions.jetpack; // player can start a jump only when they are standing on the ground. if false, player can "jetpack" anywhere anytime
var originalAnimation; // caches player avatar for use in rotation logic

// various constants for translating user movement into current gravity.
// there's probably some programmatic way to handle all this but...eh....
var gravityMap = {
	// "normal" gravity
	down: {
		up: 'up',
		down: 'down',
		left: 'left',
		right: 'right',
	},
	// upside down
	up: {
		up: 'down',
		down: 'up',
		left: 'left',
		right: 'right',
	},
	// right is the floor
	right: {
		up: 'left',
		down: 'right',
		left: 'up',
		right: 'down',
	},
	// left is the floor
	left: {
		up: 'right',
		down: 'left',
		left: 'down',
		right: 'up',
	},
};
var dirs = ['up', 'down', 'left', 'right'];
var offsets = {
	up: [0, -1],
	down: [0, 1],
	left: [-1, 0],
	right: [0, 1],
};

after('onPlayerMoved', function () {
	if (!active) return;
	var player = bitsy.player();

	wasStandingOnSomething = isSolid(gravityDir, player.x, player.y);

	// if player is standing on something and has a fallCounter > 0, then they just landed
	if (wasStandingOnSomething && fallCounter && hackOptions.landed) hackOptions.landed(fallCounter);
});

before('movePlayer', function () {
	if (!active) return;
	var player = bitsy.player();

	wasStandingOnSomething = isSolid(gravityDir, player.x, player.y);

	if (wasStandingOnSomething) {
		// reset jetpack fuel
		jumpPower = hackOptions.jumpPower;
	}

	wasClimbing = isClimbing;
	isOnClimbableTile = isTileClimbable(player.x, player.y);

	if (wasStandingOnSomething || isClimbing || wasJetpacking || forceGravityDir) {
		// reset fall counters
		fallCounter = 0;
		horizontalFallingMoves = 0;
	} else {
		// player is falling
		fallCounter += 1;
	}

	if (forceGravityDir && isSolid(forceGravityDir, player.x, player.y)) {
		// if played was being pushed, and hit a wall in that direction, turn off the push
		forceGravityDir = undefined;
	}
});


window.advanceGravity = function () {
	if (!active) return;
	var player = bitsy.player();
	// player input something, but could not move.

	// force them up if they are doing that
	if (forceGravityDir) {
		reallyMovePlayer(player, forceGravityDir);
		lastMoveMapped = forceGravityDir;
		return;
	}

	if (isOnStandableTile(player)) return;

	// otherwise:force them downward if possible.
	reallyMovePlayer(player, gravityDir);
	lastMoveMapped = 'down';
};

window.movePlayerWithGravity = function (dir, axis, amt) {
	var player = bitsy.player();
	if (!active) {
		// if the hack is not active, just move the player in the direction they pressed
		player[axis] += amt;
		return;
	}

	// if player is being pushed, just push them in that direction and skip everything else
	if (forceGravityDir) {
		reallyMovePlayer(player, forceGravityDir);
		lastMoveMapped = forceGravityDir;
		return;
	}

	// dir is the arrow pressed. realDir is what that arrow translates to in the current gravity direction...
	var realDir = mapDir(dir);
	var horizontal = realDir === 'left' || realDir === 'right';

	var canJetpack = jumpPower !== 0;

	// if jetpack is false, only let them jump if they are standing on something
	if (!jetpack && !wasStandingOnSomething && !wasJetpacking) canJetpack = false;

	// reset vars and stuff
	wasJetpacking = false;
	isClimbing = false;

	if (realDir === 'up' && (isOnClimbableTile || canJetpack)) {
		if (!isOnClimbableTile) {
			// if yr moving up, and yr not climbing, then u must be jumping/jetpacking
			wasJetpacking = true;
			jumpPower -= 1;
		} else {
			isClimbing = true;
		}
		reallyMovePlayer(player, dir);
		lastMoveMapped = realDir;
	} else if (horizontal && (wasStandingOnSomething || wasClimbing || isOnClimbableTile || isOnStandableTile(player))) {
		// u can always move horizontally if yr standing on a tile
		reallyMovePlayer(player, dir);
		lastMoveMapped = realDir;
	} else if (horizontal && canMoveHorizontallyWhileFalling()) {
		// u can sometimes move horizontally while falling
		reallyMovePlayer(player, dir);
		lastMoveMapped = realDir;
		horizontalFallingMoves += 1;
	} else if (!wasStandingOnSomething) {
		// if none of the other options are valid, and they are falling,
		// then move them in the direction of gravity
		reallyMovePlayer(player, gravityDir);
		lastMoveMapped = 'down';
	} else {
		console.warn('ignoring movement', dir, axis, amt);
	}
};

// Replace the default bitsy movement code inside `movePlayer` with our custom gravity
inject$1(/player\(\)\.x -= 1;/, "movePlayerWithGravity('left', 'x', -1);");
inject$1(/player\(\)\.x \+= 1;/, "movePlayerWithGravity('right', 'x', 1);");
inject$1(/player\(\)\.y -= 1;/, "movePlayerWithGravity('up', 'y', -1);");
inject$1(/player\(\)\.y \+= 1;/, "movePlayerWithGravity('down', 'y', 1);");

// This adds an `else` clause to the default bitsy `movePlayer` logic
// so that when the player presses a direction that they cannot move in
// they are instead forced in the direction of gravity.
// i.e, if they are standing to the left of a wall tile and press right,
// the player will fall downward if there is an empty tile beneath them
inject$1(/(var ext = getExit\( player\(\)\.room, player\(\)\.x, player\(\)\.y \);)/, 'else { advanceGravity(); didPlayerMoveThisFrame = true; } $1 ');

function mapDir(dir) {
	return gravityMap[gravityDir][dir];
}

function isValidDir(dir) {
	return dirs.indexOf(dir) !== -1;
}

function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function isSolid(dir, x, y) {
	var capDir = capitalize(dir);
	var wallCheck = `isWall${capDir}`;
	var spriteCheck = `getSprite${capDir}`;
	var isSpriteThere = bitsy[spriteCheck]();
	var edgeMap = {
		up: {
			coord: y,
			value: 0,
		},
		down: {
			coord: y,
			value: bitsy.mapsize - 1,
		},
		left: {
			coord: x,
			value: 0,
		},
		right: {
			coord: x,
			value: bitsy.mapsize - 1,
		},
	};
	var edgeToCheck = edgeMap[dir];
	var isWallThere = bitsy[wallCheck]() || (edgeToCheck.coord === edgeToCheck.value);

	return isWallThere || isSpriteThere;
}

function isTileClimbable(x, y) {
	var tile = bitsy.tile[bitsy.getTile(x, y)];
	return tile && hackOptions.isClimbable(tile);
}

function isOnStandableTile(player) {
	if (fallCounter > 1) {
		return false;
	}
	var coords = [player.x, player.y];
	var offset = offsets[gravityDir]; // like [0, -1] for y -= 1
	coords[0] += offset[0];
	coords[1] += offset[1];
	var tile = bitsy.tile[bitsy.getTile(coords[0], coords[1])];
	return tile && hackOptions.isStandable(tile);
}

function canMoveHorizontallyWhileFalling() {
	var withinMaxRatio = (horizontalFallingMoves / fallCounter) <= hackOptions.maxHorizontalFallingRatio;

	// if fallCounter is 0 (start of fall/jump) or player last moved down and is within ratio
	return !fallCounter || (lastMoveMapped === 'down' && withinMaxRatio);
}

function reallyMovePlayer(player, dir) {
	if (isSolid(dir, player.x, player.y)) {
		// can't move into solid thing...so...chill?
		// should maybe trigger sprites here?
		return;
	}

	// why doesn't isSolid catch the out of bounds? stuff? isWall should as well? weird...
	switch (dir) {
	case 'up':
		if (player.y > 0) player.y -= 1;
		break;
	case 'down':
		if (player.y < bitsy.mapsize - 1) player.y += 1;
		break;
	case 'left':
		if (player.x > 0) player.x -= 1;
		break;
	case 'right':
		if (player.x < bitsy.mapsize - 1) player.x += 1;
		break;
	default:
		console.warn('gravity: invalid move', player.x, player.y, dir);
	}
}


function flipAvatar(gravityDirection) {
	var hflip = false;
	var vflip = false;
	var rot = false;
	var i;
	// save the original frames
	if (!originalAnimation || originalAnimation.referenceFrame !== getSpriteData(bitsy.playerId, 0)) {
		originalAnimation = {
			frames: [],
		};
		for (i = 0; i < bitsy.player().animation.frameCount; ++i) {
			originalAnimation.frames.push(getSpriteData(bitsy.playerId, i));
		}
	}

	// determine which directions need flipping
	switch (gravityDirection) {
	case 'up':
		vflip = true;
		break;
	case 'down':
		vflip = false;
		break;
	case 'left':
		vflip = true;
		rot = true;
		break;
	case 'right':
		rot = true;
		break;
	}

	// update sprite with transformed frames
	for (i = 0; i < originalAnimation.frames.length; ++i) {
		setSpriteData(bitsy.playerId, i, transformSpriteData(originalAnimation.frames[i], vflip, hflip, rot));
	}
	originalAnimation.referenceFrame = getSpriteData(bitsy.playerId, 0);
}

addDualDialogTag('setGravityDirection', function (env, params) {
	var newGravityDir = params[0];
	if (isValidDir(newGravityDir)) {
		gravityDir = newGravityDir;
	} else {
		console.error('gravity: setGravityDirection failed, expected "up|down|left|right", but got ', newGravityDir);
	}
	if (hackOptions.flipAvatarOnGravityChange) flipAvatar(newGravityDir);
});

addDualDialogTag('toggleGravity', function () {
	active = !active;
});

addDualDialogTag('setJumpPower', function (env, params) {
	var amt = Number(params[0]);
	if (Number.isNaN(amt)) {
		// 1 or '1' are valid but not 'one'
		console.error('gravity: setJumpPower failed, expected a number, but got ', amt);
	} else {
		hackOptions.jumpPower = amt; // sets base jumpPower that gets re-plenished upon landing
		jumpPower = amt; // re-fills players current jumpPowers so they can get jumps mid-air
	}
});

addDualDialogTag('toggleJetpack', function () {
	jetpack = !jetpack;
});

addDualDialogTag('forceGravity', function (env, params) {
	var newForceGravityDir = params[0];
	if (isValidDir(newForceGravityDir)) {
		forceGravityDir = newForceGravityDir;
	} else {
		console.error('gravity: forceGravity failed, expected "up|down|left|right", but got ', forceGravityDir);
	}
});

exports.hackOptions = hackOptions;

}(this.hacks.gravity = this.hacks.gravity || {}, window));

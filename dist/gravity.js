/**
🍂
@file gravity
@summary Pseudo-platforming/gravity/physics
@license MIT
@author Cole Sea
@version 23.0.0
@requires Bitsy 8.13


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

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
@version 23.0.0
@requires Bitsy 8.13

*/


/*
Helper for getting image by name or id

Args:
	name: id or name of image to return
	 map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: the image in the given map with the given name/id
 */
function getImage(name, map) {
	var id = Object.prototype.hasOwnProperty.call(map, name)
		? name
		: Object.keys(map).find(function (e) {
				return map[e].name === name;
			});
	return map[id];
}

/**
@file edit image at runtime
@summary API for updating image data at runtime.
@author Sean S. LeBlanc
@version 23.0.0
@requires Bitsy 8.13

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
	return bitsy.renderer.GetDrawingSource(getImage(id, map).drw)[frame];
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
	var img = bitsy.renderer.GetDrawingSource(drw).slice();
	img[frame] = newData;
	bitsy.renderer.SetDrawingSource(drw, img);
}

function setSpriteData(id, frame, newData) {
	setImageData(id, frame, bitsy.sprite, newData);
}

/**
 * Helper used to replace code in a script tag based on a search regex.
 * To inject code without erasing original string, using capturing groups; e.g.
 * ```js
 * inject(/(some string)/,'injected before $1 injected after');
 * ```
 * @param searcher Regex to search and replace
 * @param replacer Replacer string/fn
 */
function inject$1(searcher, replacer) {
    // find the relevant script tag
    var scriptTags = document.getElementsByTagName('script');
    var scriptTag;
    var code = '';
    for (var i = 0; i < scriptTags.length; ++i) {
        scriptTag = scriptTags[i];
        if (!scriptTag.textContent)
            continue;
        var matchesSearch = scriptTag.textContent.search(searcher) !== -1;
        var isCurrentScript = scriptTag === document.currentScript;
        if (matchesSearch && !isCurrentScript) {
            code = scriptTag.textContent;
            break;
        }
    }
    // error-handling
    if (!code || !scriptTag) {
        throw new Error('Couldn\'t find "' + searcher + '" in script tags');
    }
    // modify the content
    code = code.replace(searcher, replacer);
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
// Ex: inject(/(names.sprite.set\( name, id \);)/, '$1console.dir(names)');
/** test */
function kitsyInject(searcher, replacer) {
    if (!kitsy.queuedInjectScripts.some(function (script) {
        return searcher.toString() === script.searcher.toString() && replacer === script.replacer;
    })) {
        kitsy.queuedInjectScripts.push({
            searcher: searcher,
            replacer: replacer,
        });
    }
    else {
        console.warn('Ignored duplicate inject');
    }
}
// Ex: before('load_game', function run() { alert('Loading!'); });
//     before('show_text', function run(text) { return text.toUpperCase(); });
//     before('show_text', function run(text, done) { done(text.toUpperCase()); });
function before$1(targetFuncName, beforeFn) {
    kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
    kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
}
// Ex: after('load_game', function run() { alert('Loaded!'); });
function after$1(targetFuncName, afterFn) {
    kitsy.queuedAfterScripts[targetFuncName] = kitsy.queuedAfterScripts[targetFuncName] || [];
    kitsy.queuedAfterScripts[targetFuncName].push(afterFn);
}
function applyInjects() {
    kitsy.queuedInjectScripts.forEach(function (injectScript) {
        inject$1(injectScript.searcher, injectScript.replacer);
    });
}
function applyHooks(root) {
    var allHooks = unique(Object.keys(kitsy.queuedBeforeScripts).concat(Object.keys(kitsy.queuedAfterScripts)));
    allHooks.forEach(applyHook.bind(this, root || window));
}
function applyHook(root, functionName) {
    var functionNameSegments = functionName.split('.');
    var obj = root;
    while (functionNameSegments.length > 1) {
        obj = obj[functionNameSegments.shift()];
    }
    var lastSegment = functionNameSegments[0];
    var superFn = obj[lastSegment];
    var superFnLength = superFn ? superFn.length : 0;
    var functions = [];
    // start with befores
    functions = functions.concat(kitsy.queuedBeforeScripts[functionName] || []);
    // then original
    if (superFn) {
        functions.push(superFn);
    }
    // then afters
    functions = functions.concat(kitsy.queuedAfterScripts[functionName] || []);
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
/**
@file kitsy-script-toolkit
@summary Monkey-patching toolkit to make it easier and cleaner to run code before and after functions or to inject new code into script tags
@license WTFPL (do WTF you want)
@author Original by mildmojo; modified by Sean S. LeBlanc
@version 23.0.0
@requires Bitsy 8.13

*/
var kitsy = (window.kitsy = window.kitsy || {
    queuedInjectScripts: [],
    queuedBeforeScripts: {},
    queuedAfterScripts: {},
    inject: kitsyInject,
    before: before$1,
    after: after$1,
    /**
     * Applies all queued `inject` calls.
     *
     * An object that instantiates an class modified via injection will still refer to the original class,
     * so make sure to reinitialize globals that refer to injected scripts before calling `applyHooks`.
     */
    applyInjects,
    /** Apples all queued `before`/`after` calls. */
    applyHooks,
});

// Rewrite custom functions' parentheses to curly braces for Bitsy's
// interpreter. Unescape escaped parentheticals, too.
function convertDialogTags(input, tag) {
	return input.replace(new RegExp('\\\\?\\((' + tag + '(\\s+(".*?"|.+?))?)\\\\?\\)', 'g'), function (match, group) {
		if (match.substr(0, 1) === '\\') {
			return '(' + group + ')'; // Rewrite \(tag "..."|...\) to (tag "..."|...)
		}
		return '{' + group + '}'; // Rewrite (tag "..."|...) to {tag "..."|...}
	});
}

var hooked = kitsy.hooked;
if (!hooked) {
	kitsy.hooked = true;
	var oldStartFunc = bitsy.startExportedGame;
	bitsy.startExportedGame = function doAllInjections() {
		// Only do this once.
		bitsy.startExportedGame = oldStartFunc;

		// Rewrite scripts
		kitsy.applyInjects();

		// recreate the script and dialog objects so that they'll be
		// referencing the code with injections instead of the original
		bitsy.scriptModule = new bitsy.Script();
		bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();

		bitsy.dialogModule = new bitsy.Dialog();
		bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
		bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();
		bitsy.renderer = new bitsy.TileRenderer(bitsy.tilesize);
		bitsy.transition = new bitsy.TransitionManager();

		// Hook everything
		kitsy.applyHooks();

		// Start the game
		bitsy.startExportedGame.apply(this, arguments);
	};
}

/** @see kitsy.inject */
var inject = kitsy.inject;
/** @see kitsy.before */
var before = kitsy.before;
/** @see kitsy.after */
var after = kitsy.after;

function addDialogFunction(tag, fn) {
	kitsy.dialogFunctions = kitsy.dialogFunctions || {};
	if (kitsy.dialogFunctions[tag]) {
		console.warn('The dialog function "' + tag + '" already exists.');
		return;
	}

	// Hook into game load and rewrite custom functions in game data to Bitsy format.
	before('parseWorld', function (gameData) {
		return [convertDialogTags(gameData, tag)];
	});

	kitsy.dialogFunctions[tag] = fn;
}

function injectDialogTag(tag, code) {
	inject(/(var functionMap = \{\};[^]*?)(this.HasFunction)/m, '$1\nfunctionMap["' + tag + '"] = ' + code + ';\n$2');
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
	injectDialogTag(tag, 'kitsy.dialogFunctions["' + tag + '"]');
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
	var deferred = (bitsy.kitsy.deferredDialogFunctions[tag] = []);
	injectDialogTag(tag, 'function(e, p, o){ kitsy.deferredDialogFunctions["' + tag + '"].push({e:e,p:p}); o(null); }');
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
		var result = fn(environment, parameters);
		onReturn(result === undefined ? null : result);
	});
	addDeferredDialogTag(tag, fn);
}

/**
@file transform sprite data
@summary Helpers for flipping and rotating sprite data
*/

// copied from https://stackoverflow.com/a/46805290
function transpose(matrix) {
	const rows = matrix.length;
	const cols = matrix[0].length;
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
	var y;
	var y2;
	var tmp;
	var s = spriteData.slice();
	if (v) {
		for (y = 0; y < s.length / 2; ++y) {
			y2 = s.length - y - 1;
			tmp = s[y];
			s[y] = s[y2];
			s[y2] = tmp;
		}
	}
	if (rot) {
		s = transpose(s);
	}
	return s;
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

var px;
var py;
var pr;
var player;
before('bitsy._update', function () {
	player = bitsy.player();
	if (!player) return;
	px = player.x;
	py = player.y;
	pr = player.room;
});
after('bitsy._update', function () {
	if (!player) return;
	if (px !== player.x || py !== player.y || pr !== player.room) {
		if (!active) return;

		wasStandingOnSomething = isSolid(gravityDir, player.x, player.y);

		// if player is standing on something and has a fallCounter > 0, then they just landed
		if (wasStandingOnSomething && fallCounter && hackOptions.landed) hackOptions.landed(fallCounter);
	}
});

before('movePlayer', function () {
	if (!active) return;

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
inject(/player\(\)\.x -= 1;/, "movePlayerWithGravity('left', 'x', -1);");
inject(/player\(\)\.x \+= 1;/, "movePlayerWithGravity('right', 'x', 1);");
inject(/player\(\)\.y -= 1;/, "movePlayerWithGravity('up', 'y', -1);");
inject(/player\(\)\.y \+= 1;/, "movePlayerWithGravity('down', 'y', 1);");

// This adds an `else` clause to the default bitsy `movePlayer` logic
// so that when the player presses a direction that they cannot move in
// they are instead forced in the direction of gravity.
// i.e, if they are standing to the left of a wall tile and press right,
// the player will fall downward if there is an empty tile beneath them
inject(/(var ext = getExit\( player\(\)\.room, player\(\)\.x, player\(\)\.y \);)/, 'else { advanceGravity(); didPlayerMoveThisFrame = true; } $1 ');

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
	var isWallThere = bitsy[wallCheck]() || edgeToCheck.coord === edgeToCheck.value;

	return isWallThere || isSpriteThere;
}

function isTileClimbable(x, y) {
	var tile = bitsy.tile[bitsy.getTile(x, y)];
	return tile && hackOptions.isClimbable(tile);
}

function isOnStandableTile(p) {
	if (fallCounter > 1) {
		return false;
	}
	var coords = [p.x, p.y];
	var offset = offsets[gravityDir]; // like [0, -1] for y -= 1
	coords[0] += offset[0];
	coords[1] += offset[1];
	var tile = bitsy.tile[bitsy.getTile(coords[0], coords[1])];
	return tile && hackOptions.isStandable(tile);
}

function canMoveHorizontallyWhileFalling() {
	var withinMaxRatio = horizontalFallingMoves / fallCounter <= hackOptions.maxHorizontalFallingRatio;

	// if fallCounter is 0 (start of fall/jump) or player last moved down and is within ratio
	return !fallCounter || (lastMoveMapped === 'down' && withinMaxRatio);
}

function reallyMovePlayer(p, dir) {
	if (isSolid(dir, p.x, p.y)) {
		// can't move into solid thing...so...chill?
		// should maybe trigger sprites here?
		return;
	}

	// why doesn't isSolid catch the out of bounds? stuff? isWall should as well? weird...
	switch (dir) {
		case 'up':
			if (p.y > 0) p.y -= 1;
			break;
		case 'down':
			if (p.y < bitsy.mapsize - 1) p.y += 1;
			break;
		case 'left':
			if (p.x > 0) p.x -= 1;
			break;
		case 'right':
			if (p.x < bitsy.mapsize - 1) p.x += 1;
			break;
		default:
			console.warn('gravity: invalid move', p.x, p.y, dir);
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

})(this.hacks.gravity = this.hacks.gravity || {}, window);

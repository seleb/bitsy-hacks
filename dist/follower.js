/**
💕
@file follower
@summary make sprites follow the player
@license MIT
@author Sean S. LeBlanc
@version 20.2.5
@requires Bitsy 7.12


@description
Make sprites follow the player.
Followers can optionally collide with the player,
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
	(follower "a") - the sprite with the id "a" starts/stops following
	(follower "my follower") - the sprite with the name "my follower" starts/stops following
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
  between walls and their followers. Make sure to avoid single-tile width
  spaces when using this (or design with that restriction in mind!)

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below to set up initial followers
3. Use dialog commands as needed
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	allowFollowerCollision: false, // if true, the player can walk into followers and talk to them (possible to get stuck this way)
	followers: ['a'], // ids or names of sprites to be followers; use [] to start without a follower
	delay: 200, // delay between each follower step (0 is immediate, 400 is twice as slow as normal)
	stack: false, // if true, followers stack on top of each other; otherwise, they will form a chain
};

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

bitsy = bitsy || /*#__PURE__*/_interopDefaultLegacy(bitsy);

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
@version 20.2.5
@requires Bitsy 7.12

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

		// reset callbacks using hacked functions
		bitsy.bitsyOnUpdate(bitsy.update);
		bitsy.bitsyOnQuit(bitsy.stopGame);
		bitsy.bitsyOnLoad(bitsy.load_game);

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
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
@version 20.2.5
@requires Bitsy 7.12

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





var followers = [];
var paths = {};

function setFollower(followerName) {
	var follower = followerName && getImage(followerName, bitsy.sprite);
	if (!follower) {
		throw new Error('Failed to find sprite with id/name "' + followerName + '"');
	}
	var idx = followers.indexOf(follower);
	if (idx >= 0) {
		followers.splice(idx, 1);
	} else {
		followers.push(follower);
	}
	paths[follower.id] = paths[follower.id] || [];
	takeStep();
}

var walking = false;
var shouldWalk = false;

function takeStep() {
	if (walking) {
		return;
	}
	walking = true;
	setTimeout(() => {
		shouldWalk = true;
	}, hackOptions.delay);
}

after('startExportedGame', function () {
	hackOptions.followers.forEach(setFollower);

	// remove + add player to sprite list to force rendering them on top of followers
	var p = bitsy.sprite[bitsy.playerId];
	delete bitsy.sprite[bitsy.playerId];
	bitsy.sprite[bitsy.playerId] = p;
});

let px;
let py;
before('update', function () {
	px = bitsy.player().x;
	py = bitsy.player().y;
});
let movedFollower = false;
after('update', function () {
	if (shouldWalk) {
		shouldWalk = false;
		let takeAnother = false;
		followers.forEach(function (follower) {
			var path = paths[follower.id];
			var point = path.shift();
			if (point) {
				follower.x = point.x;
				follower.y = point.y;
				follower.room = point.room;
			}
			walking = false;
			if (path.length) {
				takeAnother = true;
			}
		});
		if (takeAnother) {
			takeStep();
		}
	}

	// only walk if player moved
	if (px === bitsy.player().x && py === bitsy.player().y) {
		return;
	}
	// skip walking if already moved due to exits
	if (movedFollower) {
		movedFollower = false;
		return;
	}

	if (!followers.length) {
		takeStep();
		walking = false;
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
	followers.forEach(function (follower, idx) {
		if (idx === 0 || hackOptions.stack) {
			paths[follower.id].push(step);
		} else {
			var prevFollower = followers[idx - 1];
			var prev = paths[prevFollower.id];
			paths[follower.id].push(
				prev[prev.length - 2] || {
					x: prevFollower.x,
					y: prevFollower.y,
					room: prevFollower.room,
				}
			);
		}
	});
	takeStep();
});

// make followers walk "through" exits
before('movePlayerThroughExit', function (exit) {
	if (followers.length) {
		movedFollower = true;
		followers.forEach(function (follower) {
			paths[follower.id].push({
				x: exit.dest.x,
				y: exit.dest.y,
				room: exit.dest.room,
			});
		});
		takeStep();
	}
});

function filterFollowing(id) {
	return followers.some(function (follower) {
		return follower.id === id;
	})
		? null
		: id;
}

var originalGetSpriteLeft;
var originalGetSpriteRight;
var originalGetSpriteUp;
var originalGetSpriteDown;
before('movePlayer', function () {
	originalGetSpriteLeft = bitsy.getSpriteLeft;
	originalGetSpriteRight = bitsy.getSpriteRight;
	originalGetSpriteUp = bitsy.getSpriteUp;
	originalGetSpriteDown = bitsy.getSpriteDown;

	// filter follower out of collisions
	bitsy.getSpriteLeft = function () {
		if (!hackOptions.allowFollowerCollision) {
			return filterFollowing(originalGetSpriteLeft());
		}
		return originalGetSpriteLeft();
	};
	bitsy.getSpriteRight = function () {
		if (!hackOptions.allowFollowerCollision) {
			return filterFollowing(originalGetSpriteRight());
		}
		return originalGetSpriteRight();
	};
	bitsy.getSpriteUp = function () {
		if (!hackOptions.allowFollowerCollision) {
			return filterFollowing(originalGetSpriteUp());
		}
		return originalGetSpriteUp();
	};
	bitsy.getSpriteDown = function () {
		if (!hackOptions.allowFollowerCollision) {
			return filterFollowing(originalGetSpriteDown());
		}
		return originalGetSpriteDown();
	};
});

after('movePlayer', function () {
	bitsy.getSpriteLeft = originalGetSpriteLeft;
	bitsy.getSpriteRight = originalGetSpriteRight;
	bitsy.getSpriteUp = originalGetSpriteUp;
	bitsy.getSpriteDown = originalGetSpriteDown;
});

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
	var player = bitsy.player();
	followers.forEach(function (follower) {
		follower.room = player.room;
		follower.x = player.x;
		follower.y = player.y;
		paths[follower.id].length = 0;
	});
});

exports.followers = followers;
exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})(this.hacks.follower = this.hacks.follower || {}, window);

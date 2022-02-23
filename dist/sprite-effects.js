/**
💃
@file sprite effects
@summary like text effects, but for sprites
@license MIT
@author Sean S. LeBlanc
@version 20.1.0
@requires Bitsy 7.12


@description
Adds support for applying effects to sprites, items, and tiles.

Usage:
	{spriteEffect "SPR,A,wvy"}
	{spriteEffectNow "TIL,a,shk"}

To disable a text effect, call the dialog command again with the same parameters.

Note that if a name is used instead of an id,
only the first tile with that name is affected.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `hackOptions` object at the top of the script with your custom effects

EFFECT NOTES:
Each effect looks like:
	key: function(pos, time, context) {
		...
	}

The key is the name of the effect, used in the dialog command to apply it.

The function is called every frame before rendering the images it is applied to.
The function arguments are:
	pos:     has the properties `x` and `y`; can be used to modify rendered position
	time:    the current time in milliseconds; can be used to animate effects over time
	context: the 2D canvas rendering context; can be used for various advanced effects
	         (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	// map of custom effects
	effects: {
		wvy: function (pos, time) {
			// sample effect based on bitsy's {wvy} text
			pos.y += (Math.sin(time / 250 - pos.x / 2) * 4) / bitsy.mapsize;
		},
		shk: function (pos, time) {
			// sample effect based on bitsy's {shk} text
			function disturb(func, offset, mult1, mult2) {
				return func(time * mult1 - offset * mult2);
			}
			var y = (3 / bitsy.mapsize) * disturb(Math.sin, pos.x, 0.1, 0.5) * disturb(Math.cos, pos.x, 0.3, 0.2) * disturb(Math.sin, pos.y, 2.0, 1.0);
			var x = (3 / bitsy.mapsize) * disturb(Math.cos, pos.y, 0.1, 1.0) * disturb(Math.sin, pos.x, 3.0, 0.7) * disturb(Math.cos, pos.x, 0.2, 0.3);
			pos.x += x;
			pos.y += y;
		},
		rbw: function (pos, time, context) {
			// sample effect based on bitsy's {rbw} text
			// note that this uses CSS filters (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter)
			var t = Math.sin(time / 600 - (pos.x + pos.y) / 8);
			context.filter = 'grayscale() sepia() saturate(2) hue-rotate(' + t + 'turn)';
		},
		invert: function (pos, time, context) {
			context.filter = 'invert()';
		},
	},
	// reset function called after drawing a tile
	// this can be used to undo any modifications to the canvas or context
	reset: function (context) {
		context.filter = 'none';
	},
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
@version 20.1.0
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
@version 20.1.0
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





var activeEffects = {
	tile: {},
	sprite: {},
	item: {},
};

// create a map of the images to be rendered for reference
// note: this is being done after `drawRoom` to avoid interfering
// with transparent sprites, which needs to pre-process first
var tileMap = {
	tile: {},
	sprite: {},
	item: {},
};
function buildMap(map, room) {
	var m = tileMap[map];
	Object.keys(activeEffects[map]).forEach(function (id) {
		var tile = bitsy[map][id];
		if (!tile) {
			return;
		}
		var t = (m[id] = m[id] || {});
		var p = (t[room.pal] = t[room.pal] || {});
		new Array(tile.animation.frameCount).fill(0).forEach(function (_, frame) {
			p[frame] = bitsy.getTileFrame(tile, frame);
		});
	});
}
after('drawRoom', function (room) {
	buildMap('tile', room);
	buildMap('sprite', room);
	buildMap('item', room);
});

// apply effects before rendering tiles
function preprocess(map, img, x, y) {
	var m = tileMap[map];
	var foundEffects = Object.entries(activeEffects[map]).find(function (entry) {
		var t = m && m[entry[0]];
		var p = t && t[bitsy.room[bitsy.curRoom].pal];
		return (
			p &&
			Object.values(p).some(function (frame) {
				return frame === img;
			})
		);
	});
	var effects = foundEffects ? foundEffects[1] : [];

	if (effects.length === 0) return [img, x, y];

	return [{ img, effects }, x, y];
}
before('drawTile', function (img, x, y) {
	return preprocess('tile', img, x, y);
});
before('drawSprite', function (img, x, y) {
	return preprocess('sprite', img, x, y);
});
before('drawItem', function (img, x, y) {
	return preprocess('item', img, x, y);
});

before('renderTileInstruction', function (bufferId, buffer, tileId, x, y) {
	if (typeof tileId === 'string' || typeof tileId === 'number') return [bufferId, buffer, tileId, x, y];

	var bufferContext = buffer.canvas.getContext('2d');
	var totalPos = { x: Number(x), y: Number(y) };
	Object.keys(tileId.effects).forEach(function (effect) {
		var pos = { x: totalPos.x, y: totalPos.y };
		hackOptions.effects[effect](pos, Date.now(), bufferContext);
		totalPos = pos;
	});
	return [bufferId, buffer, tileId.img, x, y];
});
after('renderTileInstruction', function (bufferId, buffer, tileId, x, y) {
	hackOptions.reset(buffer.canvas.getContext('2d'));
});

// reset after having drawn a tile
after('drawTile', function (img, x, y) {});

// setup dialog commands
var mapMap = {
	spr: 'sprite',
	sprite: 'sprite',
	itm: 'item',
	item: 'item',
	til: 'tile',
	tile: 'tile',
};
addDualDialogTag('spriteEffect', function (environment, parameters) {
	var params = parameters[0].split(/,\s?/);
	var map = mapMap[(params[0] || '').toLowerCase()];
	var id = getImage(params[1] || '', bitsy[map]).id;
	var effect = params[2] || '';
	if (!hackOptions.effects[effect]) {
		throw new Error('Tried to use sprite effect "' + effect + '", but it does not exist');
	}
	var tile = (activeEffects[map][id] = activeEffects[map][id] || {});
	if (tile && tile[effect]) {
		delete tile[effect];
	} else {
		tile[effect] = true;
	}
});

// reset
before('reset_cur_game', function () {
	activeEffects = {
		tile: {},
		sprite: {},
		item: {},
	};
	tileMap = {
		tile: {},
		sprite: {},
		item: {},
	};
});

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})(this.hacks.sprite_effects = this.hacks.sprite_effects || {}, window);

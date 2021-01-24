/**
💃
@file sprite effects
@summary like text effects, but for sprites
@license MIT
@version 15.4.1
@requires 7.1
@author Sean S. LeBlanc

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
	reset: function (img, context) {
		context.filter = 'none';
	},
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

// Ex: inject(/(names.sprite.set\( name, id \);)/, '$1console.dir(names)');
function inject$1(searchRegex, replaceString) {
	var kitsy = kitsyInit();
	if (
		!kitsy.queuedInjectScripts.some(function (script) {
			return searchRegex.toString() === script.searchRegex.toString() && replaceString === script.replaceString;
		})
	) {
		kitsy.queuedInjectScripts.push({
			searchRegex: searchRegex,
			replaceString: replaceString,
		});
	} else {
		console.warn('Ignored duplicate inject');
	}
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

// Rewrite custom functions' parentheses to curly braces for Bitsy's
// interpreter. Unescape escaped parentheticals, too.
function convertDialogTags(input, tag) {
	return input
		.replace(new RegExp('\\\\?\\((' + tag + '(\\s+(".*?"|.+?))?)\\\\?\\)', 'g'), function (match, group) {
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
	inject$1(
		/(var functionMap = new Map\(\);[^]*?)(this.HasFunction)/m,
		'$1\nfunctionMap.set("' + tag + '", ' + code + ');\n$2',
	);
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
	var deferred = bitsy.kitsy.deferredDialogFunctions[tag] = [];
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
		fn(environment, parameters);
		onReturn(null);
	});
	addDeferredDialogTag(tag, fn);
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
			p[frame] = bitsy.getTileImage(tile, room.pal, frame);
		});
	});
}
after('drawRoom', function (room) {
	buildMap('tile', room);
	buildMap('sprite', room);
	buildMap('item', room);
});

// apply effects before rendering tiles
function preprocess(map, img, x, y, context) {
	var m = tileMap[map];
	var foundEffects = Object.entries(activeEffects[map]).find(function (entry) {
		var t = m && m[entry[0]];
		var p = t && t[bitsy.room[bitsy.curRoom].pal];
		return (
			p
			&& Object.values(p).some(function (frame) {
				return frame === img;
			})
		);
	});
	var effects = foundEffects ? foundEffects[1] : [];

	var totalPos = { x: Number(x), y: Number(y) };
	Object.keys(effects).forEach(function (effect) {
		var pos = { x: totalPos.x, y: totalPos.y };
		hackOptions.effects[effect](pos, Date.now(), context);
		totalPos = pos;
	});
	return [img, totalPos.x.toString(), totalPos.y.toString(), context];
}
before('drawTile', function (img, x, y, context) {
	return preprocess('tile', img, x, y, context);
});
before('drawSprite', function (img, x, y, context) {
	return preprocess('sprite', img, x, y, context);
});
before('drawItem', function (img, x, y, context) {
	return preprocess('item', img, x, y, context);
});

// reset after having drawn a tile
after('drawTile', function (img, x, y, context) {
	hackOptions.reset(img, context);
});

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

}(this.hacks.sprite_effects = this.hacks.sprite_effects || {}, window));

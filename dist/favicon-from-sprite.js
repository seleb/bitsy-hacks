/**
🌐
@file favicon-from-sprite
@summary generate a browser favicon (tab icon) from a Bitsy sprite, including animation!
@license WTFPL (do WTF you want)
@author @mildmojo
@version 20.1.0
@requires Bitsy 7.12


@description
Use one of your game sprites as the page favicon. It'll even animate if the
sprite has multiple frames!

HOW TO USE:
  1. Copy-paste this script into a new script tag after the Bitsy source code.
  2. Edit the configuration below to set which sprite and colors this mod
     should use for the favicon. By default, it will render the player avatar
     sprite in the first available palette's colors.
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	SPRITE_NAME: '', // Sprite name as entered in editor (not case-sensitive). Defaults to player avatar.
	PALETTE_ID: 0, // Palette name or number to draw colors from. (Names not case-sensitive.)
	BG_COLOR_NUM: 0, // Favicon background color in palette. 0 = BG, 1 = Tile, 2 = Sprite.
	FG_COLOR_NUM: 2, // Favicon sprite color in palette. 0 = BG, 1 = Tile, 2 = Sprite.
	PIXEL_PADDING: 1, // Padding around sprite, in Bitsy pixel units.
	ROUNDED_CORNERS: true, // Should the favicon have rounded corners? (Suggest margin 2px if rounding.)
	FRAME_DELAY: 400, // Frame change interval (ms) if sprite is animated. Use `Infinity` to disable.
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
function inject(searcher, replacer) {
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
function before(targetFuncName, beforeFn) {
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
        inject(injectScript.searcher, injectScript.replacer);
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
    before,
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
kitsy.inject;
/** @see kitsy.before */
kitsy.before;
/** @see kitsy.after */
var after = kitsy.after;

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



// CONFIGURATION FOR FAVICON

// END CONFIG

var FAVICON_SIZE = 16; // pixels
var ONE_PIXEL_SCALED = FAVICON_SIZE / bitsy.tilesize;
hackOptions.PIXEL_PADDING *= ONE_PIXEL_SCALED;
var canvas = document.createElement('canvas');
canvas.width = FAVICON_SIZE + 2 * hackOptions.PIXEL_PADDING;
canvas.height = FAVICON_SIZE + 2 * hackOptions.PIXEL_PADDING;
var ctx = canvas.getContext('2d');
var faviconLinkElem;
var faviconFrameURLs = [];
var isStarted = false;

after('load_game', function () {
	if (isStarted) {
		return;
	}
	isStarted = true;

	var frameNum = 0;
	var frames = getFrames(hackOptions.SPRITE_NAME);

	faviconFrameURLs = frames.map(drawFrame);

	// Only one frame? Don't even bother with the loop, just paint the icon once.
	if (frames.length === 1) {
		updateBrowserFavicon(faviconFrameURLs[0]);
		return;
	}

	setInterval(function () {
		frameNum = ++frameNum % frames.length;
		updateBrowserFavicon(faviconFrameURLs[frameNum]);
	}, hackOptions.FRAME_DELAY);
});

function drawFrame(frameData) {
	var pal = getPalette(hackOptions.PALETTE_ID);
	var bgColor = (pal && pal[hackOptions.BG_COLOR_NUM]) || [20, 20, 20];
	var spriteColor = (pal && pal[hackOptions.FG_COLOR_NUM]) || [245, 245, 245];
	var roundingOffset = hackOptions.ROUNDED_CORNERS ? ONE_PIXEL_SCALED : 0;

	// Approximate a squircle-shaped background by drawing a fat plus sign with
	// two overlapping rects, leaving some empty pixels in the corners.
	var longSide = FAVICON_SIZE + 2 * hackOptions.PIXEL_PADDING;
	var shortSide = longSide - roundingOffset * ONE_PIXEL_SCALED;
	ctx.fillStyle = rgb(bgColor);
	ctx.fillRect(roundingOffset, 0, shortSide, longSide);
	ctx.fillRect(0, roundingOffset, longSide, shortSide);

	// Draw sprite foreground.
	ctx.fillStyle = rgb(spriteColor);
	Object.keys(frameData).forEach(function (y) {
		Object.keys(frameData).forEach(function (x) {
			if (frameData[y][x] === 1) {
				ctx.fillRect(x * ONE_PIXEL_SCALED + hackOptions.PIXEL_PADDING, y * ONE_PIXEL_SCALED + hackOptions.PIXEL_PADDING, ONE_PIXEL_SCALED, ONE_PIXEL_SCALED);
			}
		});
	});

	return canvas.toDataURL('image/x-icon');
}

function updateBrowserFavicon(dataURL) {
	// Add or modify favicon link tag in document.
	faviconLinkElem = faviconLinkElem || document.querySelector('#favicon');
	if (!faviconLinkElem) {
		faviconLinkElem = document.createElement('link');
		faviconLinkElem.id = 'favicon';
		faviconLinkElem.type = 'image/x-icon';
		faviconLinkElem.rel = 'shortcut icon';
		document.head.appendChild(faviconLinkElem);
	}
	faviconLinkElem.href = dataURL;
}

function getFrames(spriteName) {
	var frames = bitsy.renderer.GetDrawingSource(getImage(spriteName || bitsy.playerId, bitsy.sprite).drw);
	return frames;
}

function getPalette(id) {
	var palId = id;

	if (Number.isNaN(Number(palId))) {
		// Search palettes by name. `palette` is an object with numbers as keys. Yuck.
		// Palette names are case-insensitive to avoid Bitsydev headaches.
		palId = Object.keys(bitsy.palette).find(function (i) {
			return bitsy.palette[i].name && bitsy.palette[i].name.toLowerCase() === palId.toLowerCase();
		});
	}

	return bitsy.getPal(palId);
}

// Expects values = [r, g, b]
function rgb(values) {
	return 'rgb(' + values.join(',') + ')';
}

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})(this.hacks["favicon-from-sprite"] = this.hacks["favicon-from-sprite"] || {}, window);

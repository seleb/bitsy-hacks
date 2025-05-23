/**
🎞
@file custom-exit-effects
@summary make custom exit transition effects
@license MIT
@author Sean S. LeBlanc
@version 23.0.0
@requires Bitsy 8.13


@description
Adds support for custom exit transition effects.
Multiple effects can be added this way.
This can be combined with exit-from-dialog for custom dialog transitions too.

Effects are limited to a relatively low framerate,
and note that the way bitsy renders transitions is fairly inefficient;
for fancier effects it may be better to try the GL transitions hack.

EFFECT NOTES:
Each effect looks like:
	key: {
		showPlayerStart: <true or false>,
		showPlayerEnd: <true or false>,
		stepCount: <number (how long/granular the transition is; built-in effects are all 6, 8, or 12)>
		pixelEffectFunc: function(start, end, pixelX, pixelY, delta) {
			...
		},
		paletteEffectFunc: function(start, end, delta) {
			...
		},
	}

To use the custom effects, you'll need to modify your exit in the gamedata, e.g.
	EXT 1,1 0 13,13
would become
	EXT 1,1 0 13,13 FX key

A single example effect is included, but more can be found in the original effect source by looking for `RegisterTransitionEffect`.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `hackOptions` object at the top of the script with your custom effects
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	// a simple crossfade example effect
	'my-effect': {
		showPlayerStart: true,
		showPlayerEnd: true,
		stepCount: 8,
		pixelEffectFunc: function (start, end, pixelX, pixelY, delta) {
			return (delta > 0.5 ? end : start).GetPixel(pixelX, pixelY);
		},
		paletteEffectFunc: function (start, end, delta) {
			return lerpPalettes(start.Palette, end.Palette, delta);
		},
	},
};

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
function before$1(targetFuncName, beforeFn) {
    kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
    kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
}
// Ex: after('load_game', function run() { alert('Loaded!'); });
function after(targetFuncName, afterFn) {
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
@version 23.0.0
@requires Bitsy 8.13

*/
var kitsy = (window.kitsy = window.kitsy || {
    queuedInjectScripts: [],
    queuedBeforeScripts: {},
    queuedAfterScripts: {},
    inject: kitsyInject,
    before: before$1,
    after,
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

		// Start the game
		bitsy.startExportedGame.apply(this, arguments);
	};
}

/** @see kitsy.inject */
kitsy.inject;
/** @see kitsy.before */
var before = kitsy.before;
/** @see kitsy.after */
kitsy.after;





function lerpColor(colorA, colorB, t) {
	return [colorA[0] + (colorB[0] - colorA[0]) * t, colorA[1] + (colorB[1] - colorA[1]) * t, colorA[2] + (colorB[2] - colorA[2]) * t];
}
function lerpPalettes(start, end, delta) {
	var colors = [];

	var maxLength = start.Palette.length > end.Palette.length ? start.Palette.length : end.Palette.length;

	for (var i = 0; i < maxLength; i++) {
		if (i < start.Palette.length && i < end.Palette.length) {
			colors.push(lerpColor(start.Palette[i], end.Palette[i], delta));
		} else if (i < start.Palette.length) {
			colors.push(lerpColor(start.Palette[i], end.Palette[end.Palette.length - 1], delta));
		} else if (i < end.Palette.length) {
			colors.push(lerpColor(start.Palette[start.Palette.length - 1], end.Palette[i], delta));
		}
	}

	return colors;
}

before('startExportedGame', function () {
	// make the custom effects available
	Object.entries(hackOptions).forEach(function (entry) {
		bitsy.transition.RegisterTransitionEffect(entry[0], entry[1]);
	});
});

exports.hackOptions = hackOptions;

})(this.hacks["custom-exit-effects"] = this.hacks["custom-exit-effects"] || {}, window);

/**
🔈
@file basic sfx
@summary "walk" and "talk" sound effect support
@license MIT
@author Sean S. LeBlanc
@version 23.0.0
@requires Bitsy 8.13


@description
Adds a basic sound effect API and hooks up "walk" and "talk" sound effects

The walk sound effect plays every time the player moves.
The talk sound effect plays every time the dialog box changes "pages" (e.g. when it opens, when the player presses a key to continue).

Includes an optional feature which makes sound effect volume reduce if it was played recently.
If you only want one of the two sound effects to play, delete the other from `hackOptions`.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Place your "walk" and "talk" sound files somewhere relative to your bitsy html file
3. Update `hackOptions` below with your filepaths

If you'd like more control over triggering sounds from dialog, check out the bitsymuse hack!
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	beNiceToEars: true, // if `true`, reduces volume of recently played sound effects
	walk: { src: './example walk filepath.mp3' },
	talk: { src: './example talk filepath.mp3' },
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
var after = kitsy.after;

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
@version 23.0.0
@requires Bitsy 8.13

*/


/**
 * @param {number} value number to clamp
 * @param {number} min minimum
 * @param {number} max maximum
 * @return min if value < min, max if value > max, value otherwise
 */
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function createAudio(id, options) {
	// delete duplicate
	var el = document.getElementById(id);
	if (el) el.remove();

	// create element
	el = document.createElement('audio');
	var src = options.src;
	el.id = id;
	Object.assign(el, options);
	if (typeof src !== 'string') {
		el.removeAttribute('src');
		src.forEach(function (s) {
			var sourceEl = document.createElement('source');
			sourceEl.src = s;
			sourceEl.type = 'audio/' + s.split('.').pop();
			el.appendChild(sourceEl);
		});
	}
	document.body.appendChild(el);
	return el;
}





var sounds = {};
before('startExportedGame', function () {
	function playSound(sound) {
		if (hackOptions.beNiceToEars) {
			// reduce volume if played recently
			sound.volume = clamp(((bitsy.prevTime - (sound.lastPlayed || -Infinity)) * 0.002) ** 0.5, 0.25, 1.0);
			sound.lastPlayed = bitsy.prevTime;
		}

		// play sound
		if (sound.paused) {
			sound.play();
		} else {
			sound.currentTime = 0;
		}
	}

	if (hackOptions.walk) sounds.walk = playSound.bind(undefined, createAudio('walk', hackOptions.walk));
	if (hackOptions.talk) sounds.talk = playSound.bind(undefined, createAudio('talk', hackOptions.talk));
});

// walk hook
var px;
var py;
var pr;
before('bitsy._update', function () {
	var player = bitsy.player();
	if (!player) return;
	px = player.x;
	py = player.y;
	pr = player.room;
});
after('bitsy._update', function () {
	var player = bitsy.player();
	if (!player) return;
	if ((px !== player.x || py !== player.y || pr !== player.room) && sounds.walk) {
		sounds.walk();
	}
});

// talk hooks
after('startDialog', function () {
	if (sounds.talk) sounds.talk();
});
after('dialogBuffer.FlipPage', function () {
	if (sounds.talk) sounds.talk();
});

exports.hackOptions = hackOptions;

})(this.hacks.basic_sfx = this.hacks.basic_sfx || {}, window);

/**
😌
@file bitsymuse
@summary A variety of Bitsy sound and music handlers
@license MIT
@author David Mowatt
@version 21.0.3
@requires Bitsy 8.1


@description
A hack that adds a variety of audio controls, including music that changes as you move between rooms.
If the same song is played as you move between rooms, the audio file will continue playing.

Check out https://kool.tools/bitsy/tools/bitsymuse-ui for a tool to help configure this hack.

If you only want to play a single song as a background track,
check out https://candle.itch.io/bitsy-audio for a simpler solution.

HOW TO USE:
1. Place your audio files somewhere relative to your bitsy html file (in the zip if you're uploading to itch.io)
2. Copy-paste this script into a script tag after the bitsy source.
3. Edit hackOptions below to set up the track list for rooms you move through.

In addition to the track list, which will play audio based on the room id/name,
you have access to the following commands you can add to dialogue:

1. (soundeffectNow "<audio ID>") will play a sound without interrupting the music as soon as it is called in the dialogue
2. (soundeffect "<audio ID>") will play a sound without interrupting the music once the dialogue box closes
3. (musicNow "<audio ID>") will change the music as soon as it is called in the dialogue
4. (music "<audio ID>") will change the music once the dialogue box closes

You can call both musicNow and music in the same dialogue, to e.g. change the music while you speak to a character
and then restart the regular room music once you stop speaking to them.
You can also use a special ID ("S" by default) to Silence the music.

By default, music tracks automatically restart from the beginning if you go back to a previous track.
This can also be changed in the hackOptions below.
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	// Put entries in this list for each audio file you want to use
	// the key will be the id needed to play it in dialog tags and the musicByRoom options below,
	// and the value will be the properties of the corresponding <audio> tag (e.g. src, loop, volume)
	// `src` can be either a string, or an array of strings (to support fallbacks in different formats)
	// Note: you can add <audio> tags to the html manually if you prefer
	audio: {
		// Note: the entries below are examples that should be removed and replaced with your own audio files
		'example song ID': { src: './example song filepath.mp3', loop: true },
		'example sfx ID': { src: './example sfx filepath.mp3', volume: 0.5 },
		'example with multiple formats': { src: ['./preferred.mp3', './fallback.ogg'] },
	},
	// Put entries in this list for every room ID or name that will change the music
	// If the player moves between rooms with the same audio ID, the music keeps playing seamlessly.
	// Undefined rooms will keep playing whatever music they were last playing
	musicByRoom: {
		// Note: the entries below are examples that should be removed and replaced with your own room -> audio id mappings
		0: 'example song ID',
		1: 'S', // This room is silent - it will stop music when you enter (see `silenceId` below)
		2: 'another song ID',
		h: 'a song ID for a room with a non-numeric ID',
		'my room': 'a song ID for a room with a user-defined name',
	},
	silenceId: 'S', // Use this song ID to make a room fall silent.
	resume: false, // If true, songs will pause/resume on change; otherwise, they'll stop/play (doesn't affect sound effects)
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
@version 21.0.3
@requires Bitsy 8.1

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
@version 21.0.3
@requires Bitsy 8.1

*/

/**
 * Helper for getting room by name or id
 * @param {string} name id or name of room to return
 * @return {string} room, or undefined if it doesn't exist
 */
function getRoom(name) {
	var id = Object.prototype.hasOwnProperty.call(bitsy.room, name) ? name : bitsy.names.room[name];
	return bitsy.room[id];
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





var audioElementsById = {};
var currentMusic;
var roomMusicFlag = null;

after('load_game', function () {
	var room;
	// expand the map to include ids of rooms listed by name
	Object.entries(hackOptions.musicByRoom).forEach(function (entry) {
		room = getRoom(entry[0]);
		if (room) {
			hackOptions.musicByRoom[room.id] = entry[1];
		}
	});
	// add audio tags from options
	Object.entries(hackOptions.audio).forEach(function (entry) {
		audioElementsById[entry[0]] = createAudio(entry[0], entry[1]);
	});

	// handle autoplay restrictions by playing then pausing
	// every audio element on the first user interaction
	function handleAutoPlayRestrictions() {
		Object.values(audioElementsById).forEach(function (audio) {
			audio.play();
			// let the current song play
			if (currentMusic === audio.id) {
				return;
			}
			audio.pause();
			audio.currentTime = 0;
		});
		document.body.removeEventListener('pointerup', handleAutoPlayRestrictions);
		document.body.removeEventListener('keydown', handleAutoPlayRestrictions);
	}

	document.body.addEventListener('pointerup', handleAutoPlayRestrictions);
	document.body.addEventListener('keydown', handleAutoPlayRestrictions);
});

function getAudio(id) {
	var el = audioElementsById[id] || (audioElementsById[id] = document.getElementById(id));
	if (!el) {
		throw new Error("bitsymuse tried to use audio with id '" + id + "' but couldn't find one on the page!");
	}
	return el;
}

function playSound(soundParam) {
	if (!soundParam) {
		return;
	}
	getAudio(soundParam).play();
}

function changeMusic(newMusic) {
	var audio;
	// if we didn't get new music,
	// or the music didn't change,
	// there's no work to be done
	if (!newMusic || newMusic === currentMusic) {
		return;
	}

	// stop old music
	if (currentMusic && currentMusic !== hackOptions.silenceId) {
		audio = getAudio(currentMusic);
		audio.pause();
		if (!hackOptions.resume) {
			audio.currentTime = 0.0;
		}
	}

	// start new music
	currentMusic = newMusic;
	// special case: don't start anything new
	if (newMusic === hackOptions.silenceId) {
		return;
	}
	getAudio(newMusic).play();
}

after('drawRoom', function () {
	if (roomMusicFlag !== bitsy.state.room) {
		changeMusic(hackOptions.musicByRoom[bitsy.state.room]);
		roomMusicFlag = bitsy.state.room;
	}
});

// Implement the dialog functions
addDualDialogTag('music', function (environment, parameters) {
	if (!parameters[0]) {
		throw new Error('{music/musicNow} was missing parameters! Usage: {music/musicNow "track name"}');
	}
	changeMusic(parameters[0]);
});

addDualDialogTag('soundeffect', function (environment, parameters) {
	if (!parameters[0]) {
		throw new Error('{soundeffect/soundeffectNow} was missing parameters! Usage: {soundeffect/soundeffectNow "track name"}');
	}
	playSound(parameters[0]);
});
// End of (music) dialog function mod

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})(this.hacks.bitsymuse = this.hacks.bitsymuse || {}, window);

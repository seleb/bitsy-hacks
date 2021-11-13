/**
🗣
@file text-to-speech
@summary text-to-speech for bitsy dialog
@license MIT
@author Sean S. LeBlanc
@version 19.2.0
@requires Bitsy 7.10


@description
Adds text-to-speech (TTS) to bitsy dialog.

Support is included for both an automatic mode in which all dialog is run through TTS,
and a manual mode in which TTS can be triggered via dialog commands.

Due to how bitsy handles scripting, the automatic mode is only able to read a segment of dialog *after* it has finished printing.
This means that normally you'd often be waiting a long time for text animation to complete before hearing the TTS.
Players could manually skip the dialog animations to speed this up, but I've found that this is still quite stilted.
The hackOption `hurried` is included below, which automatically skips text animation in order to help counteract this.

Usage:
	(ttsVoice "<pitch>,<rate>,<voice>")
	(ttsVoiceNow "<pitch>,<rate>,<voice>")
	(tts "<text queued to speak at end of dialog>")
	(ttsNow "<text queued to speak immediately>")

Example:
	(ttsVoiceNow "0.5,0.5,Google UK English Male")
	(ttsNow "This will be heard but not seen.")

Notes:
	- Because the TTS reads an entire page at once, voice parameters cannot be changed mid-line.
	  If you're using multiple voices, make sure to only set voices at the start and/or end of pages.
	- Unprovided voice parameters will default to the last value used
	  e.g. if you lower the pitch, read a line, increase the rate, read another line,
	  the second line will have both a lower pitch and a higher rate.
	- Voice support varies a lot by platform!
	  In general, you should only rely on a single voice (the locally provided synth) being available.
	  In chrome, a number of remote synths are provided, but these will only work while online.
	  You can use whatever voices are available, but be aware that they may fallback to default for players.
	- To see what voices are available in your browser, run `speechSynthesis.getVoices()` in the console

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	automatic: true, // disable this to prevent TTS from playing for all dialog (i.e. you only want to use TTS via commands)
	hurried: true, // disable this to let bitsy text animations play out normally (not recommended for automatic mode)
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
@version 19.2.0
@requires Bitsy 7.10

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
		fn(environment, parameters);
		onReturn(null);
	});
	addDeferredDialogTag(tag, fn);
}





var speaking = false;
var toSpeak = [];
var latestUtterance; // we need to maintain a reference to this, or a bug in the GC will prevent events from firing
var lastPitch = 1;
var lastRate = 1;
var lastVoice = '';

var voices = {};

var speechSynthesis = window.speechSynthesis;
if (!speechSynthesis) {
	console.error('TTS not available!');
} else {
	speechSynthesis.onvoiceschanged = function () {
		var v = speechSynthesis.getVoices();
		voices = v.reduce(function (result, voice) {
			result[voice.name] = voice;
			return result;
		}, {});
	};
}

function queueVoice(params) {
	params = params || [];
	var pitch = (lastPitch = params[0] || lastPitch);
	var rate = (lastRate = params[1] || lastRate);
	var voice = (lastVoice = params[2] || lastVoice);
	toSpeak.push({
		pitch: pitch,
		rate: rate,
		voice: voice,
		text: [],
	});
}

function queueSpeak(text) {
	if (!toSpeak.length) {
		queueVoice();
	}
	toSpeak[toSpeak.length - 1].text.push(text);
	if (!speaking) {
		speak();
	}
}

function speak() {
	if (!speechSynthesis) {
		return;
	}
	if (!toSpeak.length) {
		return;
	}
	var s = toSpeak.shift();
	speechSynthesis.cancel();
	var text = s.text.join(' ');
	if (!text) {
		speak();
		return;
	}
	console.log('TTS: ', text);
	latestUtterance = new SpeechSynthesisUtterance(text);
	latestUtterance.pitch = s.pitch;
	latestUtterance.rate = s.rate;
	latestUtterance.voice = voices[s.voice];
	latestUtterance.onend = function () {
		setTimeout(() => {
			speaking = false;
			if (toSpeak.length) {
				speak();
			}
		});
	};
	latestUtterance.onerror = function (error) {
		speaking = false;
		console.error(error);
	};
	speaking = true;
	speechSynthesis.speak(latestUtterance);
}

// queue a newline when dialog ends in case you start a new dialog before the TTS finishes
// this smooths out the TTS playback in cases without punctuation (which is common b/c bitsyfolk)
after('dialogBuffer.EndDialog', function () {
	queueVoice();
});

// save the character on dialog font characters so we can read it back post-render
inject(/(function DialogFontChar\(font, char, effectList\) {)/, '$1\nthis.char = char;');

// queue speaking based on whether we have finished rendering text
var spoke = false;
after('dialogRenderer.DrawNextArrow', function () {
	if (hackOptions.automatic && !spoke) {
		queueSpeak(
			bitsy.dialogBuffer
				.CurPage()
				.map(a => a.map(i => i.char).join(''))
				.join(' ')
		);
		spoke = true;
	}
});
after('dialogBuffer.Continue', function () {
	spoke = false;
});

// hook up hurried mode
function hurry() {
	setTimeout(() => {
		if (hackOptions.hurried && bitsy.dialogBuffer.CurPage()) {
			bitsy.dialogBuffer.Skip();
		}
	});
}
after('dialogBuffer.FlipPage', hurry);
after('startDialog', hurry);

// hook up dialog commands
addDualDialogTag('ttsVoice', function (environment, parameters) {
	queueVoice(parameters[0].split(','));
});
addDualDialogTag('tts', function (environment, parameters) {
	queueSpeak(parameters[0]);
});

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})(this.hacks["text-to-speech"] = this.hacks["text-to-speech"] || {}, window);

/**
🗣
@file text-to-speech
@summary text-to-speech for bitsy dialog
@license MIT
@version 1.0.4
@requires 5.5
@author Sean S. LeBlanc

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

bitsy = bitsy && Object.prototype.hasOwnProperty.call(bitsy, 'default') ? bitsy['default'] : bitsy;

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
	var pitch = lastPitch = params[0] || lastPitch;
	var rate = lastRate = params[1] || lastRate;
	var voice = lastVoice = params[2] || lastVoice;
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
inject$1(/(function DialogFontChar\(font, char, effectList\) {)/, '$1\nthis.char = char;');

// queue speaking based on whether we have finished rendering text
var spoke = false;
after('dialogRenderer.DrawNextArrow', function () {
	if (hackOptions.automatic && !spoke) {
		queueSpeak(bitsy.dialogBuffer.CurPage().map((a) => a.map((i) => i.char).join('')).join(' '));
		spoke = true;
	}
});
after('dialogBuffer.Continue', function () {
	spoke = false;
});

// hook up hurried mode
function hurry() {
	if (hackOptions.hurried) {
		bitsy.dialogBuffer.Skip();
	}
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

}(this.hacks['text-to-speech'] = this.hacks['text-to-speech'] || {}, window));

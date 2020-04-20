/**
😌
@file bitsymuse
@summary A variety of Bitsy sound and music handlers
@license MIT
@version 3.1.3
@requires 4.8, 4.9
@author David Mowatt

@description
A hack that adds a variety of audio controls, including music that changes as you move between rooms.
If the same song is played as you move between rooms, the audio file will continue playing.

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
	// Note: you can add <audio> tags to the html manually if you prefer
	audio: {
		// Note: the entries below are examples that should be removed and replaced with your own audio files
		'example song ID': { src: './example song filepath.mp3', loop: true },
		'example sfx ID': { src: './example sfx filepath.mp3', volume: 0.5 },
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

/**
 * Helper for getting room by name or id
 * @param {string} name id or name of room to return
 * @return {string} room, or undefined if it doesn't exist
 */
function getRoom(name) {
	var id = Object.prototype.hasOwnProperty.call(bitsy.room, name) ? name : bitsy.names.room.get(name);
	return bitsy.room[id];
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

function injectDialogTag(tag, code) {
	inject$1(
		/(var functionMap = new Map\(\);[^]*?)(this.HasFunction)/m,
		'$1\nfunctionMap.set("' + tag + '", ' + code + ');\n$2'
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
		var el = document.createElement('audio');
		el.id = entry[0];
		Object.assign(el, entry[1]);
		document.body.appendChild(el);
		audioElementsById[el.id] = el;
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
	if (roomMusicFlag !== bitsy.curRoom) {
		changeMusic(hackOptions.musicByRoom[bitsy.curRoom]);
		roomMusicFlag = bitsy.curRoom;
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

}(this.hacks.bitsymuse = this.hacks.bitsymuse || {}, window));

/**
😌
@file bitsymuse
@summary A variety of Bitsy sound and music handlers
@license MIT
@version 1.0.0
@requires 4.8, 4.9
@author David Mowatt

@description
A hack that a variety of audio controls, including music that changes as you move between rooms.
If the same song is played as you move between rooms, the audio file will continue playing.

HOW TO USE:
1. Place your audio files somewhere relative to your bitsy html file (in the zip if you're uploading to itch.io)
2. Copy-paste `<audio id="<sound ID>" src="<relative path to sound file>"></audio>` into the <head> of your document.
   You need to do it once for each sound file you are adding, and each needs a unique sound ID. Add "loop" after the src=""
   tag if it's music that's going to loop (so `<audio id ="<sound id> src="<path>" loop></audio>
3. Copy-paste this script into a script tag after the bitsy source.
4. Edit hackOptions below to set up the TRACK LIST for rooms you move through.

In addition to the track list, which will play audio based on the room number, you have access to the following
commands you can add to dialogue:

1. soundeffect ("<sound ID>") will play a sound without interrupting the music
2. music ("<sound ID>?) will change the music as soon as it is called in the dialogue
3. musicEnd ("<sound ID>") will change the music once the dialogue box closes

You can call both music and musicEnd in the same dialogue, to e.g. change the music while you speak to a character
and then restart the regular room music once you stop speaking to them. "S" can be used as a sound ID for music
and musicEnd to Silence the music.

Whenever music tracks are changed they automatically restart from the beginning if you go back to a previous track.

*/
(function (bitsy) {
'use strict';
var hackOptions = {
	musicByRoom: {
		0: 'song ID',
		1: 'S', // This room is silent - it will stop music when you enter
		2: 'another song ID',
		'room ID': 'third song ID'
	}
	//You need to put an entry in this list for every ROOM NUMBER that is accessible by the player,
	//and then specify the song ID for each room. Expand this list to as many rooms as you need.
	//If the player moves between rooms with the same audio ID the music keeps playing seamlessly.
	//Undefined rooms will keep playing whatever music they were last playing
	//You may add a song ID of 'S' to make a room fall silent.
};

bitsy = bitsy && bitsy.hasOwnProperty('default') ? bitsy['default'] : bitsy;

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
*/

/*helper used to inject code into script tags based on a search string*/
function inject(searchString, codeToInject) {
	var args = [].slice.call(arguments);
	codeToInject = flatten(args.slice(1)).join('');

	// find the relevant script tag
	var scriptTags = document.getElementsByTagName('script');
	var scriptTag;
	var code;
	for (var i = 0; i < scriptTags.length; ++i) {
		scriptTag = scriptTags[i];
		var matchesSearch = scriptTag.textContent.indexOf(searchString) !== -1;
		var isCurrentScript = scriptTag === document.currentScript;
		if (matchesSearch && !isCurrentScript) {
			code = scriptTag.textContent;
			break;
		}
	}

	// error-handling
	if (!code) {
		throw 'Couldn\'t find "' + searchString + '" in script tags';
	}

	// modify the content
	code = code.replace(searchString, searchString + codeToInject);

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

function flatten(list) {
	if (!Array.isArray(list)) {
		return list;
	}

	return list.reduce(function (fragments, arg) {
		return fragments.concat(flatten(arg));
	}, []);
}

/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@version 2.0.0
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
HOW TO USE:
  import {before, after, inject} from "./kitsy-script-toolkit.js";

  before(targetFuncName, beforeFn);
  after(targetFuncName, afterFn);
  inject(searchString, codeFragment1[, ...codefragmentN]);

  For more info, see the documentation at:
  https://github.com/seleb/bitsy-hacks/wiki/Coding-with-kitsy
*/


// Examples: inject('names.sprite.set( name, id );', 'console.dir(names)');
//           inject('names.sprite.set( name, id );', 'console.dir(names);', 'console.dir(sprite);');
//           inject('names.sprite.set( name, id );', ['console.dir(names)', 'console.dir(sprite);']);
function inject$1(searchString, codeFragments) {
	var kitsy = kitsyInit();
	var args = [].slice.call(arguments);
	codeFragments = flatten(args.slice(1));

	kitsy.queuedInjectScripts.push({
		searchString: searchString,
		codeFragments: codeFragments
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
		inject(injectScript.searchString, injectScript.codeFragments);
	});
	_reinitEngine();
}

function applyAllHooks() {
	var allHooks = unique(Object.keys(bitsy.kitsy.queuedBeforeScripts).concat(Object.keys(bitsy.kitsy.queuedAfterScripts)));
	allHooks.forEach(applyHook);
}

function applyHook(functionName) {
	var superFn = bitsy[functionName];
	var superFnLength = superFn.length;
	var functions = [];
	// start with befores
	functions = functions.concat(bitsy.kitsy.queuedBeforeScripts[functionName] || []);
	// then original
	functions.push(superFn);
	// then afters
	functions = functions.concat(bitsy.kitsy.queuedAfterScripts[functionName] || []);

	// overwrite original with one which will call each in order
	bitsy[functionName] = function () {
		var args = [].slice.call(arguments);
		var i = 0;
		runBefore.apply(this, arguments);

		// Iterate thru sync & async functions. Run each, finally run original.
		function runBefore() {
			// All outta functions? Finish
			if (i === functions.length) {
				return;
			}

			// Update args if provided.
			if (arguments.length > 0) {
				args = [].slice.call(arguments);
			}

			if (functions[i].length > superFnLength) {
				// Assume funcs that accept more args than the original are
				// async and accept a callback as an additional argument.
				functions[i++].apply(this, args.concat(runBefore.bind(this)));
			} else {
				// run synchronously
				var newArgs = functions[i++].apply(this, args) || args;
				runBefore.apply(this, newArgs);
			}
		}
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





var currentMusic;

var roomMusicFlag = null;


function playSound(soundParam) {

	if (!soundParam) {
		return;
	}
	
	document.getElementById(soundParam).play();

}

function changeMusic(newMusic) {

	if (!newMusic) {
		return;
	}
	
	if (newMusic === currentMusic) {
		return;
	}

	if (newMusic === 'S') {
		if (currentMusic !== 'S' && currentMusic) {
			document.getElementById(currentMusic).pause();
			document.getElementById(currentMusic).currentTime = 0.0;
		}
		currentMusic = newMusic;
		return;
	}

	if (currentMusic === undefined) {
		document.getElementById(newMusic).play();
		currentMusic = newMusic;
	} else {
		if (currentMusic !== 'S'&& currentMusic) {
			document.getElementById(currentMusic).pause();
			document.getElementById(currentMusic).currentTime = 0.0;
		}
		document.getElementById(newMusic).play();
		currentMusic = newMusic;
	}

}

after('drawRoom', function () {
	if (roomMusicFlag !== bitsy.curRoom) {	
		changeMusic(hackOptions.musicByRoom[bitsy.curRoom]);
		roomMusicFlag = bitsy.curRoom;
	}
});

var queuedMusic = null;

// Hook into game load and rewrite custom functions in game data to Bitsy format.
before('load_game', function (game_data, startWithTitle) {
	// Rewrite custom functions' parentheses to curly braces for Bitsy's
	// interpreter. Unescape escaped parentheticals, too.
	var fixedGameData = game_data
	.replace(/(^|[^\\])\((music(End)? ".+?")\)/g, "$1{$2}") // Rewrite (music...) to {music...}
	.replace(/\\\((music(End)? ".+")\\?\)/g, "($1)") // Rewrite \(music...\) to (music...)
	.replace(/(^|[^\\])\((soundeffect ".+?")\)/g, "$1{$2}") // Rewrite (soundeffect) to {soundeffect}
	.replace(/\\\((soundeffect ".+")\\?\)/g, "($1)"); // Rewrite \(soundeffect...\) to (soundeffect...)

	return [fixedGameData, startWithTitle];
});

// Hook into the game reset and make sure music data gets cleared.
after('clearGameData', function () {
	queuedMusic = null;
});

// Hook into the dialog finish event; if there was a {musicEnd}, play it now.
after('onExitDialog', function () {
	if (queuedMusic) {
		changeMusic(queuedMusic);
		queuedMusic = null;
	}
});

// Implement the {music} dialog function. It changes the music track as soon as
// it is called.
bitsy.musicFunc = function (environment, parameters, onReturn) {
	var musicParams = _getMusicParams('music', parameters);
	if (!musicParams) {
		return;
	}

	changeMusic(musicParams);
	onReturn(null);
};

// Implement the {musicEnd} dialog function. It saves the new track name and 
// changes it once the dialog closes.
bitsy.musicEndFunc = function (environment, parameters, onReturn) {
	queuedMusic = _getMusicParams('musicEnd', parameters);

	onReturn(null);
};

bitsy.soundeffectFunc = function (environment, parameters, onReturn) {
	var soundParams = _getMusicParams('soundeffect', parameters);
	if (!soundParams) {
		return;
	}
	
	playSound(soundParams);
	onReturn(null);
};

// Rewrite the Bitsy script tag, making these new functions callable from dialog.
inject$1(
	'var functionMap = new Map();',
	'functionMap.set("music", musicFunc);',
	'functionMap.set("musicEnd", musicEndFunc);',
	'functionMap.set("soundeffect", soundeffectFunc);'
);

function _getMusicParams(musicFuncName, parameters) {
	var params = parameters[0].split(',');
	var trackName = params[0];

	if (!trackName) {
		console.warn('{' + musicFuncName + '} was missing parameters! Usage: {' +
			musicFuncName + ' "track name"}');
		return null;
	}

	return trackName;
}


// End of (music) dialog function mod

}(window));

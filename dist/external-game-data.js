/**
🛰
@file external-game-data
@summary separate Bitsy game data from your (modded) HTML for easier development
@license WTFPL (do WTF you want)
@version 2.1.3
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
Load your Bitsy game data from an external file or URL, separating it from your
(modified) Bitsy HTML.

Usage: IMPORT <file or URL>

Examples: IMPORT frontier.bitsydata
          IMPORT http://my-cool-website.nz/frontier/frontier.bitsydata
          IMPORT /games/frontier/data/frontier.bitsydata

HOW TO USE:
  1. Copy-paste this script into a new script tag after the Bitsy source code.
     Make sure this script comes *after* any other mods to guarantee that it
     executes first.
  2. Copy all your Bitsy game data out of the script tag at the top of your
     HTML into another file (I recommend `game-name.bitsydata`). In the HTML
     file, replace all game data with a single IMPORT statement that refers to
     your new data file.

NOTE: Chrome can only fetch external files when they're served from a
      web server, so your game won't work if you just open your HTML file from
      disk. You could use Firefox, install a web server, or, if you have
      development tools like NodeJS, Ruby, Python, Perl, PHP, or others
      installed, here's a big list of how to use them to serve a folder as a
      local web server:
      https://gist.github.com/willurd/5720255

      If this mod finds an IMPORT statement anywhere in the Bitsy data
      contained in the HTML file, it will replace all game data with the
      IMPORTed data. It will not execute nested IMPORT statements in
      external files.
*/
(function (bitsy) {
'use strict';

bitsy = bitsy && bitsy.hasOwnProperty('default') ? bitsy['default'] : bitsy;

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

// Ex: before('load_game', function run() { alert('Loading!'); });
//     before('show_text', function run(text) { return text.toUpperCase(); });
//     before('show_text', function run(text, done) { done(text.toUpperCase()); });
function before(targetFuncName, beforeFn) {
	var kitsy = kitsyInit();
	kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
	kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
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



var ERR_MISSING_IMPORT = 1;

before('startExportedGame', function (done) {
	var gameDataElem = document.getElementById('exportedGameData');

	tryImportGameData(gameDataElem.text, function withGameData(err, importedData) {
		if (err && err.error === ERR_MISSING_IMPORT) {
			console.warn(err.message);
		} else if (err) {
			console.warn('Make sure game data IMPORT statement refers to a valid file or URL.');
			throw err;
		}

		gameDataElem.text = "\n" + dos2unix(importedData);
		done();
	});
});

function tryImportGameData(gameData, done) {
	// Make sure this game data even uses the word "IMPORT".
	if (gameData.indexOf('IMPORT') === -1) {
		return done({
			error: ERR_MISSING_IMPORT,
			message: 'No IMPORT found in Bitsy data. See instructions for external game data mod.'
		}, gameData);
	}

	var trim = function (line) {
		return line.trim();
	};
	var isImport = function (line) {
		return bitsy.getType(line) === 'IMPORT';
	};
	var importCmd = gameData
	.split("\n")
	.map(trim)
	.find(isImport);

	// Make sure we found an actual IMPORT command.
	if (!importCmd) {
		return done({
			error: ERR_MISSING_IMPORT,
			message: 'No IMPORT found in Bitsy data. See instructions for external game data mod.'
		});
	}

	var src = (importCmd || '').split(/\s+/)[1];

	if (src) {
		return fetchData(src, done);
	} else {
		return done('IMPORT missing a URL or path to a Bitsy data file!');
	}
}

function fetchData(url, done) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function () {
		if (this.status >= 200 && this.status < 400) {
			// Success!
			return done(null, this.response);
		} else {
			return done('Failed to load game data: ' + request.statusText + ' (' + this.status + ')');
		}
	};

	request.onerror = function () {
		return done('Failed to load game data: ' + request.statusText);
	};

	request.send();
}

function dos2unix(text) {
	return text.replace(/\r\n/g, "\n");
}

}(window));

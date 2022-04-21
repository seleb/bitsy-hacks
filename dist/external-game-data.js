/**
🛰
@file external-game-data
@summary separate Bitsy game data from your (modded) HTML for easier development
@license WTFPL (do WTF you want)
@author @mildmojo
@version 20.2.2
@requires Bitsy 7.12


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
@version 20.2.2
@requires Bitsy 7.12

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
var before = kitsy.before;
/** @see kitsy.after */
kitsy.after;



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

		gameDataElem.text = '\n' + dos2unix(importedData);
		done();
	});
});

function tryImportGameData(gameData, done) {
	// Make sure this game data even uses the word "IMPORT".
	if (gameData.indexOf('IMPORT') === -1) {
		return done(
			{
				error: ERR_MISSING_IMPORT,
				message: 'No IMPORT found in Bitsy data. See instructions for external game data mod.',
			},
			gameData
		);
	}

	var trim = function (line) {
		return line.trim();
	};
	var isImport = function (line) {
		return line.indexOf('IMPORT') === 0;
	};
	var importCmd = gameData.split('\n').map(trim).find(isImport);

	// Make sure we found an actual IMPORT command.
	if (!importCmd) {
		return done({
			error: ERR_MISSING_IMPORT,
			message: 'No IMPORT found in Bitsy data. See instructions for external game data mod.',
		});
	}

	var src = (importCmd || '').split(/\s+/)[1];

	if (src) {
		return fetchData(src, done);
	}
	return done('IMPORT missing a URL or path to a Bitsy data file!');
}

function fetchData(url, done) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function () {
		if (this.status >= 200 && this.status < 400) {
			// Success!
			return done(null, this.response);
		}
		return done('Failed to load game data: ' + request.statusText + ' (' + this.status + ')');
	};

	request.onerror = function () {
		return done('Failed to load game data: ' + request.statusText);
	};

	request.send();
}

function dos2unix(text) {
	return text.replace(/\r\n/g, '\n');
}

})(window);

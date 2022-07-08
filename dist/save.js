/**
💾
@file save
@summary save/load your game
@license MIT
@author Sean S. LeBlanc
@version 20.2.5
@requires Bitsy 7.12


@description
Introduces save/load functionality.

Includes:
	- data that may be saved/loaded:
		- current room/position within room
		- inventory/items in rooms
		- dialog variables
		- dialog position
	- basic autosave
	- dialog tags:
		- (save): saves game
		- (load ""): loads game; parameter is text to show as title on load
		- (clear): clears saved game
		- (saveNow)/(loadNow)/(clearNow): instant varieties of above tags

Notes:
	- Storage is implemented through browser localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
	  Remember to clear storage while working on a game, otherwise loading may prevent you from seeing your changes!
	  You can use the `clearOnStart` option to do this for you when testing.
	- This hack only tracks state which could be modified via vanilla bitsy features,
	  i.e. compatibility with other hacks that modify state varies;
	  you may need to modify save/load to include/exclude things for compatibility.
	  (feel free to ask for help tailoring these to your needs!)
	- There is only one "save slot"; it would not be too difficult to implement more,
	  but it adds a lot of complexity that most folks probably don't need.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	// when to save/load
	autosaveInterval: Infinity, // time in milliseconds between autosaves (never autosaves if Infinity)
	loadOnStart: true, // if true, loads save when starting
	clearOnEnd: false, // if true, deletes save when restarting after reaching an ending
	clearOnStart: false, // if true, deletes save when page is loaded (mostly for debugging)
	// what to save/load
	position: true, // if true, saves which room the player is in, and where they are in the room
	variables: true, // if true, saves dialog variables (note: does not include item counts)
	items: true, // if true, saves player inventory (i.e. item counts) and item placement in rooms
	dialog: true, // if true, saves dialog position (for sequences etc)
	key: 'snapshot', // where in localStorage to save/load data
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
function inject$2(searcher, replacer) {
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
        inject$2(injectScript.searcher, injectScript.replacer);
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
@version 20.2.5
@requires Bitsy 7.12

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

		// reset callbacks using hacked functions
		bitsy.bitsyOnUpdate(bitsy.update);
		bitsy.bitsyOnQuit(bitsy.stopGame);
		bitsy.bitsyOnLoad(bitsy.load_game);

		// Start the game
		bitsy.startExportedGame.apply(this, arguments);
	};
}

/** @see kitsy.inject */
var inject$1 = kitsy.inject;
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
	inject$1(/(var functionMap = \{\};[^]*?)(this.HasFunction)/m, '$1\nfunctionMap["' + tag + '"] = ' + code + ';\n$2');
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
@version 20.2.5
@requires Bitsy 7.12

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





function save() {
	var snapshot = {};
	if (hackOptions.position) {
		snapshot.room = bitsy.curRoom;
		snapshot.x = bitsy.player().x;
		snapshot.y = bitsy.player().y;
	}
	if (hackOptions.items) {
		snapshot.inventory = bitsy.player().inventory;
		snapshot.items = Object.entries(bitsy.room).map(function (room) {
			return [room[0], room[1].items];
		});
	}
	if (hackOptions.variables) {
		snapshot.variables = bitsy.scriptInterpreter.GetVariableNames().map(function (variable) {
			return [variable, bitsy.scriptInterpreter.GetVariable(variable)];
		});
	}
	if (hackOptions.dialog) {
		snapshot.sequenceIndices = bitsy.saveHack.sequenceIndices;
		snapshot.shuffles = bitsy.saveHack.shuffles;
	}
	localStorage.setItem(hackOptions.key, JSON.stringify(snapshot));
}

function load() {
	var snapshot = localStorage.getItem(hackOptions.key);
	// if there's no save, abort load
	if (!snapshot) {
		return;
	}
	snapshot = JSON.parse(snapshot);

	if (hackOptions.position) {
		if (snapshot.room) {
			bitsy.curRoom = bitsy.player().room = snapshot.room;
		}
		if (snapshot.x && snapshot.y) {
			bitsy.player().x = snapshot.x;
			bitsy.player().y = snapshot.y;
		}
	}
	if (hackOptions.items) {
		if (snapshot.inventory) {
			bitsy.player().inventory = snapshot.inventory;
		}
		if (snapshot.items) {
			snapshot.items.forEach(function (entry) {
				bitsy.room[entry[0]].items = entry[1];
			});
		}
	}
	if (hackOptions.variables && snapshot.variables) {
		snapshot.variables.forEach(function (variable) {
			bitsy.scriptInterpreter.SetVariable(variable[0], variable[1]);
		});
	}
	if (hackOptions.dialog && snapshot.sequenceIndices) {
		bitsy.saveHack.sequenceIndices = snapshot.sequenceIndices;
		bitsy.saveHack.shuffles = snapshot.shuffles;
	}
}

function clear() {
	localStorage.removeItem(hackOptions.key);
}

// setup global needed for saving/loading dialog progress
bitsy.saveHack = {
	sequenceIndices: {},
	shuffles: {},
	saveSeqIdx: function (node, index) {
		var key = node.GetId();
		bitsy.saveHack.sequenceIndices[key] = index;
	},
	loadSeqIdx: function (node) {
		var key = node.GetId();
		return bitsy.saveHack.sequenceIndices[key];
	},
	saveShuffle: function (node, options) {
		var key = node.GetId();
		bitsy.saveHack.shuffles[key] = options;
	},
	loadShuffle: function (node) {
		var key = node.GetId();
		return bitsy.saveHack.shuffles[key];
	},
};

// use saved index to eval/calc next index if available
inject(/(optionsShuffled\.push\()optionsUnshuffled\.splice\(i,1\)\[0\](\);)/, '$1 i $2 optionsUnshuffled.splice(i,1);');
inject(
	/(optionsShuffled\[index\])/,
	`
var i = window.saveHack.loadSeqIdx(this);
index = i === undefined ? index : i;
optionsShuffled = window.saveHack.loadShuffle(this) || optionsShuffled;
window.saveHack.saveShuffle(this, optionsShuffled);
options[index]`
);
inject(/(\/\/ bitsyLog\(".+" \+ index\);)/g, '$1\nvar i = window.saveHack.loadSeqIdx(this);index = i === undefined ? index : i;');
// save index on changes
inject(/(index = next;)/g, '$1window.saveHack.saveSeqIdx(this, index);');
inject(/(\tindex = 0;)/g, '$1window.saveHack.saveSeqIdx(this, index);');
inject(/(\tindex\+\+;)/g, '$1window.saveHack.saveSeqIdx(this, index);');

// hook up autosave
var autosaveInterval;
after('onready', function () {
	if (hackOptions.autosaveInterval < Infinity) {
		clearInterval(autosaveInterval);
		autosaveInterval = setInterval(save, hackOptions.autosaveInterval);
	}
});

// hook up autoload
after('onready', function () {
	if (hackOptions.loadOnStart) {
		load();
	}
});

// hook up clear on end
before('reset_cur_game', function () {
	if (hackOptions.clearOnEnd) {
		if (bitsy.isEnding) {
			clear();
		}
	}
});

// hook up clear on start
before('startExportedGame', function () {
	if (hackOptions.clearOnStart) {
		clear();
	}
});

// hook up dialog functions
function dialogLoad(environment, parameters) {
	var loadOnStart = hackOptions.loadOnStart;
	hackOptions.loadOnStart = true;
	bitsy.reset_cur_game();
	hackOptions.loadOnStart = loadOnStart;
	bitsy.dialogBuffer.EndDialog();
	bitsy.startNarrating(parameters[0] || '');
}
addDualDialogTag('save', save);
addDualDialogTag('load', dialogLoad);
addDualDialogTag('clear', clear);

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})(this.hacks.save = this.hacks.save || {}, window);

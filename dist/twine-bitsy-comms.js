/**
💱
@file twine bitsy comms
@summary interprocess communication for twine and bitsy
@license MIT
@author Sean S. LeBlanc
@version 20.2.1
@requires Bitsy 7.12


@description
Provides a method of easily integrating bitsy games into Twine games.
Variables are automatically shared between the two engines,
and dialog commands are provided which allow basic Twine commands
to be executed from inside of a bitsy game.

Twine has multiple story formats which function in different ways,
and this hack requires integration code in both engines to work properly.
Integrations for all the default Twine story formats are provided:
	SugarCube v2 macro: https://github.com/seleb/bitsy-hacks/blob/main/src/twine-bitsy-comms/SugarCube-v2.js
	SugarCube v1 macro: https://github.com/seleb/bitsy-hacks/blob/main/src/twine-bitsy-comms/SugarCube-v1.js
	Harlowe (1 and 2) script: https://github.com/seleb/bitsy-hacks/blob/main/src/twine-bitsy-comms/Harlowe.js
	Snowman script: https://github.com/seleb/bitsy-hacks/blob/main/src/twine-bitsy-comms/Snowman.js
	Sugarcane/Responsive macro: https://github.com/seleb/bitsy-hacks/blob/main/src/twine-bitsy-comms/Sugarcane-Responsive.js
	Jonah macro: https://github.com/seleb/bitsy-hacks/blob/main/src/twine-bitsy-comms/Jonah.js

Feel free to request integrations for formats not provided here.

Dialog command list:
	(twinePlay "<Twine passage title>")
	(twinePlayNow "<Twine passage title>")
	(twineBack)
	(twineBackNow)
	(twineEval "<javascript directly evaluated in macro context>")
	(twineEvalNow "<javascript directly evaluated in macro context>")

Notes:
	- eval support is commented out by default in the Twine integrations
	- Snowman's history is handled differently from other formats;
	  see: https://twinery.org/forum/discussion/3141/adding-an-undo-button-to-snowman-1-0-2
	- shared variables have prefixed names by default to avoid accidental overwriting;
	  see the hackOptions below for details

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Copy-paste the relevant story format integration script into the Story JavaScript section of your Twine game
(optional)
3. Add `.bitsy { ... }` CSS to the Story Stylesheet of your Twine game
4. Edit the variable naming functions below as needed
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	// how dialog variables will be named when they are sent out
	// default implementation is bitsy_<name>
	variableNameOut: function (name) {
		return 'bitsy_' + name;
	},
	// how item variables will be named when they are sent out
	// default implementation is bitsy_item_<name or id>
	// Note: items names in bitsy don't have to be unique,
	// so be careful of items overwriting each other if you use this!
	itemNameOut: function (id) {
		return 'bitsy_item_' + (bitsy.item[id].name || id);
	},
	// how dialog variables will be named when they are sent in
	// default implementation is twine_<name>
	variableNameIn: function (name) {
		return 'twine_' + name;
	},

	// the options below are for customizing the integration;
	// if you're using one of the provided integrations, you can safely ignore them

	// how info will be posted to external process
	// default implementation is for iframe postMessage-ing to parent page
	send: function (type, data) {
		window.parent.postMessage(
			{
				type: type,
				data: data,
			},
			'*'
		);
	},
	// how info will be received from external process
	// default implementation is for parent page postMessage-ing into iframe
	receive: function () {
		window.addEventListener(
			'message',
			function (event) {
				var type = event.data.type;
				var data = event.data.data;
				receiveMessage(type, data);
			},
			false
		);
	},
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
@version 20.2.1
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





var sending = true;

// hook up incoming listener
hackOptions.receive();

function receiveMessage(type, data) {
	switch (type) {
		case 'variables':
			var state = sending;
			sending = false;
			Object.entries(data).forEach(function (entry) {
				var name = entry[0];
				var value = entry[1];
				bitsy.scriptInterpreter.SetVariable(hackOptions.variableNameIn(name), value);
			});
			sending = state;
			break;
		default:
			console.warn('Unhandled message from outside Bitsy:', type, data);
			break;
	}
}

// hook up outgoing var/item change listeners
function sendVariable(name, value) {
	hackOptions.send('variable', {
		name: name,
		value: value,
	});
}
after('onVariableChanged', function (name) {
	if (sending) {
		sendVariable(hackOptions.variableNameOut(name), bitsy.scriptInterpreter.GetVariable(name));
	}
});
after('onInventoryChanged', function (id) {
	if (sending) {
		sendVariable(hackOptions.itemNameOut(id), bitsy.player().inventory[id]);
	}
});

// say when bitsy has started
// and initialize variables
after('startExportedGame', function () {
	bitsy.scriptInterpreter.GetVariableNames().forEach(function (name) {
		sendVariable(hackOptions.variableNameOut(name), bitsy.scriptInterpreter.GetVariable(name));
	});
	Object.values(bitsy.item).forEach(function (item) {
		sendVariable(hackOptions.itemNameOut(item.id), 0);
	});
	hackOptions.send('start', bitsy.title);
});

// hook up dialog commands
['eval', 'play', 'back'].forEach(function (command) {
	function doCommand(environment, parameters) {
		hackOptions.send(command, parameters[0]);
	}
	addDualDialogTag('twine' + command.substr(0, 1).toUpperCase() + command.substr(1), doCommand);
});

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})(this.hacks["twine-bitsy-comms"] = this.hacks["twine-bitsy-comms"] || {}, window);

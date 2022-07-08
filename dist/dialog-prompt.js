/**
⌨
@file dialog prompt
@summary prompt the user for text input in dialog
@license MIT
@author Sean S. LeBlanc
@version 20.2.5
@requires Bitsy 7.12


@description
Adds a dialog command which prompts the user for input,
and stores the result in a variable.

Note: This hack also includes the paragraph break hack;
this is because text after a dialog prompt won't show up unless
there is a paragraph break in between them.

Usage:
	(prompt "variableName")
	(prompt "variableName,defaultValue")

Examples:
	Set name: (prompt "name")
	Set name with default: (prompt "name,Adam")
	Set name using current as default: {temp="name,"+name}(prompt temp)
	Set name with text after: (prompt "name")(p)Name is now {print name}

By default, no validation or transformation is applied to the user input;
whatever they submit (even a blank input) is used as the variable value.
This can be adjusted in the hackOptions to create prompts which are constrained.

Example:

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	// character used to indicate caret
	caret: '_',
	// character used to indicate highlighted text
	highlight: '█',
	// function run when the prompt is submitted
	// whatever is returned from this function will be saved as the variable value
	// if an error is thrown, the prompt will not submit
	// (this can be used for validation, but keep in mind there's no user feedback)
	// `variable` can be used to apply different behaviour for different variable prompts
	// `value` is the current value of the text field
	onSubmit: function (variable, value) {
		return value; // allow any input
		// return value.toLowerCase(); // convert input to lowercase
		// if (value.length === 0) { throw new Error(); } return value; // require non-blank input
		// if (variable === 'name' && value.length === 0) { throw new Error(); } return value; // require non-blank input for 'name' only
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
function after(targetFuncName, afterFn) {
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
@version 20.2.5
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
var inject = kitsy.inject;
/** @see kitsy.before */
var before = kitsy.before;
/** @see kitsy.after */
kitsy.after;

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
 * Helper for printing a paragraph break inside of a dialog function.
 * Adds the function `AddParagraphBreak` to `DialogBuffer`
 */

inject(/(this\.AddLinebreak = )/, 'this.AddParagraphBreak = function() { buffer.push( [[]] ); isActive = true; };\n$1');

/**
📃
@file paragraph-break
@summary Adds paragraph breaks to the dialogue parser
@license WTFPL (do WTF you want)
@author Sean S. LeBlanc, David Mowatt
@version 20.2.5
@requires Bitsy 7.12


@description
Adds a (p) tag to the dialogue parser that forces the following text to
start on a fresh dialogue screen, eliminating the need to spend hours testing
line lengths or adding multiple line breaks that then have to be reviewed
when you make edits or change the font size.

Note: Bitsy has a built-in implementation of paragraph-break as of 7.0;
before using this, you may want to check if it fulfills your needs.

Usage: (p)

Example: I am a cat(p)and my dialogue contains multitudes

HOW TO USE:
  1. Copy-paste this script into a new script tag after the Bitsy source code.
     It should appear *before* any other mods that handle loading your game
     data so it executes *after* them (last-in first-out).

NOTE: This uses parentheses "()" instead of curly braces "{}" around function
      calls because the Bitsy editor's fancy dialog window strips unrecognized
      curly-brace functions from dialog text. To keep from losing data, write
      these function calls with parentheses like the examples above.

      For full editor integration, you'd *probably* also need to paste this
      code at the end of the editor's `bitsy.js` file. Untested.
*/

// Adds the actual dialogue tag. No deferred version is required.
addDialogTag('p', function (environment, parameters, onReturn) {
	environment.GetDialogBuffer().AddParagraphBreak();
	onReturn(null);
});
// End of (p) paragraph break mod





var cachedBuffer;
var prompted = false;

// helper for making a deep copy of dialog buffer
function bufferCopy(buffer) {
	return buffer.map(function (page) {
		return page.map(function (row) {
			return row.slice();
		});
	});
}

// manipulates dialog buffer to show the state of the form input in bitsy
function updateInputDisplay() {
	// reset to state at start of prompt
	bitsy.dialogBuffer.SetBuffer(bufferCopy(cachedBuffer));
	var highlight = promptInput.selectionEnd - promptInput.selectionStart;
	var str = promptInput.value;
	// insert caret/replace highlighted text
	str = str.substring(0, promptInput.selectionStart) + (highlight > 0 ? hackOptions.highlight.repeat(highlight) : hackOptions.caret) + str.substr(promptInput.selectionEnd);

	// show text
	bitsy.dialogBuffer.AddText(str);
	bitsy.dialogBuffer.Skip();
}

var promptForm = document.createElement('form');
// prevent form from affecting layout
promptForm.style.position = 'absolute';
promptForm.style.top = '50%';
promptForm.style.left = '50%';
promptForm.style.maxWidth = '25vh';
promptForm.style.maxHeight = '25vh';
promptForm.style.zIndex = '-1';

var promptInput = document.createElement('input');
promptInput.type = 'text';
promptInput.oninput = promptInput.onkeyup = updateInputDisplay;
promptInput.onblur = function () {
	if (prompted) {
		this.focus();
	}
};
// prevent zoom on focus
promptInput.style.fontSize = '200%';
// hide element without preventing input
promptInput.style.maxWidth = '100%';
promptInput.style.maxHeight = '100%';
promptInput.style.padding = '0';
promptInput.style.margin = '0';
promptInput.style.border = 'none';
promptInput.style.outline = 'none';

promptForm.appendChild(promptInput);
before('onready', function () {
	document.body.appendChild(promptForm);
});

addDialogTag('prompt', function (environment, parameters, onReturn) {
	prompted = true;

	// parse parameters
	var params = parameters[0].split(/,\s?/);
	var variableName = params[0];
	var defaultValue = params[1] || '';

	// prevent bitsy from handling input
	var key = bitsy.key;
	var isPlayerEmbeddedInEditor = bitsy.isPlayerEmbeddedInEditor;
	var anyKeyPressed = bitsy.input.anyKeyPressed;
	var isTapReleased = bitsy.input.isTapReleased;
	var CanContinue = environment.GetDialogBuffer().CanContinue;
	bitsy.key = {};
	bitsy.input.anyKeyPressed =
		bitsy.input.isTapReleased =
		environment.GetDialogBuffer().CanContinue =
			function () {
				return false;
			};
	bitsy.isPlayerEmbeddedInEditor = true;

	promptInput.value = defaultValue;
	promptInput.focus();
	promptForm.onsubmit = function (event) {
		event.preventDefault();
		try {
			var value = hackOptions.onSubmit(variableName, promptInput.value);
			environment.SetVariable(variableName, value);
		} catch (error) {
			return;
		}

		prompted = false;
		promptInput.blur();

		// allow bitsy to start handling input again
		bitsy.key = key;
		bitsy.isPlayerEmbeddedInEditor = isPlayerEmbeddedInEditor;
		bitsy.input.anyKeyPressed = anyKeyPressed;
		bitsy.input.isTapReleased = isTapReleased;
		environment.GetDialogBuffer().CanContinue = CanContinue;

		onReturn(null);
	};
	// save a copy of the current buffer state for display purposes
	cachedBuffer = bufferCopy(environment.GetDialogBuffer().GetBuffer());
	// add a caret character immediately (otherwise it won't show up till a key is pressed)
	environment.GetDialogBuffer().AddText(hackOptions.caret);
	updateInputDisplay();
});

// expose a setter/getter for private buffer in DialogBuffer class
inject(/(this\.CurPage =)/, 'this.GetBuffer = function(){ return buffer; };this.SetBuffer = function(b){ buffer = b; };\n$1');

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})(this.hacks.dialog_prompt = this.hacks.dialog_prompt || {}, window);

/**
🔀
@file dialog choices
@summary binary dialog choices
@license MIT
@version 1.1.0
@requires 5.3
@author Sean S. LeBlanc

@description
Adds a dialog tag which allows you to present the player with binary dialog choices.

Usage:
{choice
	- option one
	  result of picking option
	- option two
	  result of picking option
}

Recommended uses:
DLG_simple_response
"""
Greeting text
{choice
	- Response one
	  answer to response one
	- Response two
	  answer to response two
}
"""

DLG_complex_response
"""
Greeting text
{choice
	- Response one
	  {a = 1}
	- Response two
	  {a = 2}
}
constant part of answer{
	- a == 1 ?
	  custom part based on response one
	- a == 2 ?
	  custom part based on response two
}
"""

Note: it's recommended you combine this hack
with the dialog jump hack for complex cases.

Limitations:
Each option must fit on a single line, or the interaction will break.

Checking the value of a variable set in an option
*immediately after the choice* will not work,
as it will evaluate before the player has selected
an option if there is no text inbetween the two.
e.g.
"""
{a = 1}
{choice
	- Response one
	  {a = 2}
	- Response two
	  {a = 3}
}
{
	- a == 1 ?
	  this will print
	- a == 2 ?
	  these will not
	- a == 3 ?
	  these will not
}
"""

HOW TO USE:
Copy-paste into a script tag after the bitsy source
*/
this.hacks = this.hacks || {};
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
 * Helper for printing a paragraph break inside of a dialog function.
 * automatically add an appropriate number of line breaks
 * based on the current dialogue buffer size rather than the user having to count;
 * Intended to be called using the environment parameters of the original function;
 * e.g.
 * addDialogTag('myTag', function (environment, parameters, onReturn) {
 * 	addParagraphBreak(environment);
 * 	onReturn(null);
 * });
 * @param {Environment} environment Bitsy environment object; first param to a dialog function
 */
function addParagraphBreak(environment) {
    var a = environment.GetDialogBuffer().CurRowCount();
    for (var i = 0; i < 3 - a; ++i) {
        environment.GetDialogBuffer().AddLinebreak();
    }
}

/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@version 3.3.0
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
	var superFn = bitsy[functionName];
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
				var newArgs = functions[i++].apply(this, args);
				newArgs = newArgs && newArgs.length ? newArgs : args;
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



var dialogChoices = {
	choice: 0,
	choices: [],
	choicesActive: false,
	addParagraphBreak: addParagraphBreak,
	handleInput: function (dialogBuffer) {
		// navigate
		if (
			bitsy.input.isKeyDown(bitsy.key.up) ||
			bitsy.input.isKeyDown(bitsy.key.w) ||
			bitsy.input.swipeUp() ||
			bitsy.input.isKeyDown(bitsy.key.down) ||
			bitsy.input.isKeyDown(bitsy.key.s) ||
			bitsy.input.swipeDown()
		) {
			this.choice = this.choice ? 0 : 1;
			return false;
		}
		// select
		if (
			this.choicesActive &&
			(
				bitsy.input.isKeyDown(bitsy.key.right) ||
				bitsy.input.isKeyDown(bitsy.key.d) ||
				bitsy.input.isKeyDown(bitsy.key.enter) ||
				bitsy.input.isKeyDown(bitsy.key.space) ||
				bitsy.input.swipeRight()
			)
		) {
			// evaluate choice
			this.choices[this.choice]();
			// reset
			this.choice = 0;
			this.choices = [];
			this.choicesActive = false;
			// get back into the regular dialog flow
			if (dialogBuffer.Continue()) {
				dialogBuffer.Update(0);
				// make sure to close dialog if there's nothing to say
				// after the choice has been made
				if (!dialogBuffer.CurCharCount()) {
					dialogBuffer.Continue();
				}
			}
			return true;
		}
		return false;
	}
};

bitsy.dialogChoices = dialogChoices;

// parsing
// (adds a new sequence node type)
inject$1(/(\|\| str === "shuffle")/, '$1 || str === "choice"');
inject$1(/(state\.curNode\.AddChild\( new ShuffleNode\( options \) \);)/, `$1
else if(sequenceType === "choice")
	state.curNode.AddChild( new ChoiceNode( options ) );
`);

inject$1(/(var ShuffleNode = )/,`
var ChoiceNode = function(options) {
	Object.assign( this, new TreeRelationship() );
	Object.assign( this, new SequenceBase() );
	this.type = "choice";
	this.options = options;
	options.forEach(function(option){
		var br = option.children.find(function(child){ return child.name === 'br'; });
		if (!br) {
			option.onSelect = [];
			return;
		}
		var idx = option.children.indexOf(br);
		option.onSelect = option.children.slice(idx+1);
		option.children = option.children.slice(0, idx);
	});

	this.Eval = function(environment,onReturn) {
		var lastVal = null;
		var i = 0;
		function evalChildren(children,done) {
			if(i < children.length) {
				children[i].Eval(environment, function(val) {
					environment.GetDialogBuffer().AddLinebreak();
					lastVal = val;
					i++;
					evalChildren(children,done);
				});
			}
			else {
				done();
			}
		}
		window.dialogChoices.choices = this.options.map(function(option){
			return function(){
				option.onSelect.forEach(function(child){
					child.Eval(environment, function(){});
				});
			};
		});
		window.dialogChoices.addParagraphBreak(environment);
		evalChildren(this.options, function() {
			onReturn(lastVal);
			window.dialogChoices.choicesActive = true;
		});
	}
}
$1`);


// rendering
// (re-uses existing arrow image data,
// but draws rotated to point at text)
inject$1(/(this\.DrawNextArrow = )/, `
this.DrawChoiceArrow = function() {
	var top = (3 + window.dialogChoices.choice * 6) * scale;
	var left = 1 * scale;
	for (var y = 0; y < 3; y++) {
		for (var x = 0; x < 5; x++) {
			var i = (y * 5) + x;
			if (arrowdata[i] == 1) {
				//scaling nonsense
				for (var sy = 0; sy < scale; sy++) {
					for (var sx = 0; sx < scale; sx++) {
						var pxl = 4 * ( ((top+(x*scale)+sy) * (textboxInfo.width*scale)) + (left+(y*scale)+sx) );
						textboxInfo.img.data[pxl+0] = 255;
						textboxInfo.img.data[pxl+1] = 255;
						textboxInfo.img.data[pxl+2] = 255;
						textboxInfo.img.data[pxl+3] = 255;
					}
				}
			}
		}
	}
};
$1`);
inject$1(/(this\.DrawTextbox\(\);)/, `
if (window.dialogChoices.choicesActive) {
	this.DrawChoiceArrow();
}
$1`);

// interaction
// (overrides the dialog skip/page flip)
inject$1(/(\/\* CONTINUE DIALOG \*\/)/, `$1
if(window.dialogChoices.handleInput(dialogBuffer)) {
	return;
} else `);
inject$1(/(this\.CanContinue = function\(\) {)/, `$1
if(window.dialogChoices.choicesActive){
	return false;
}`);

}(window));

/**
🕷
@file itsy-bitsy
@summary for when bitsy's not small enough
@license MIT
@version 1.1.0
@requires Bitsy Version: 5.1
@author Sean S. LeBlanc

@description
Modifies bitsy to run at 64x64 pixels instead of 256x256.

Note that this means you have significantly less space for text
(text in regular bitsy is twice as large as the rest of the game)
To help deal with this, a hack option is provided which lets you
customize how many rows of text the dialog boxes will show.

HOW TO USE:
	1. Copy-paste this script into a new script tag after the Bitsy source code.
	2. edit hackOptions below as needed

NOTE:
The number of rows is the only provided hack option,
but most of the numbers being replaced can be easily
customized if you want slightly different sizes/positions.
*/
this.hacks = this.hacks || {};
this.hacks['itsy-bitsy'] = (function (exports,bitsy) {
'use strict';
var hackOptions = {
	rows: 2, // number of rows per text box (bitsy default is 2)
};

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





// rewrite main canvas width/height
inject$1(/(width =) 128/, '$1 64');
inject$1(/(height =) 128/, '$1 64');

inject$1(/4(; \/\/this is stupid but necessary)/, '1$1'); // rewrite canvas scale
inject$1(/(mapsize =) 16/, '$1 8'); // rewrite mapsize
inject$1(/(\+ 1 >=) 16/g, '$1 8'); // rewrite right/down wall checks

inject$1(/2(; \/\/using a different scaling factor for text feels like cheating\.\.\. but it looks better)/, '1$1'); // rewrite text scale

// rewrite textbox info
inject$1(/(var textboxInfo = {)[^]*?(};)/, '$1' + [
	'img : null,',
	'width : 62,',
	'height : 64,',
	'top : 1,',
	'left : 1,',
	'bottom : 1,',
	'font_scale : 1,',
	'padding_vert : 2,',
	'arrow_height : 5'
].join('\n') + '$2');
inject$1(/(top = \()4/, '$1 1');
inject$1(/(left = \()4/, '$1 1');

inject$1(/(relativeFontHeight\(\) \*) 2/, '$1 ' + hackOptions.rows); // rewrite textbox height
inject$1(/(pixelsPerRow =) 192/, '$1 62'); // rewrite hard-coded textbox wrap width
inject$1(/(else if \(curRowIndex )== 0/g, '$1< ' + (hackOptions.rows - 1)); // rewrite hard-coded row limit

// inject pixelated rendering style
var style = document.createElement('style');
style.innerText = '#game{ -ms-interpolation-mode: nearest-neighbor;image-rendering: -webkit-optimize-contrast;image-rendering: -moz-crisp-edges;image-rendering: -o-pixelated;image-rendering: pixelated; }';
document.head.appendChild(style);

exports.hackOptions = hackOptions;

return exports;

}({},window));

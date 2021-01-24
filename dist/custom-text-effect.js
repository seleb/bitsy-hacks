/**
🅰
@file custom text effect
@summary make {custom}text effects{custom}
@license MIT
@version 15.4.1
@requires 5.3
@author Sean S. LeBlanc

@description
Adds support for a custom text effect
e.g. "normal text {my-effect}custom wavy text{my-effect}"

Multiple text effects can be added this way.
Without the hack, the game will still run normally since
bitsy just ignores text tags that aren't supported.

Because the dialog system uses private variables,
this one does some silly things with code injection.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `hackOptions` object at the top of the script with your custom effects

TEXT EFFECT NOTES:
Each effect looks like:
	key: function() {
		this.DoEffect = function (char, time) {
			// effect code
		}
	}

The key is the text you'll write inside {} in bitsy to trigger the effect

`this.DoEffect` is called every frame for the characters the effect is applied to

The first argument is `char`, an individual character, which has the following properties:
	offset: offset from actual position in pixels. starts at {x:0, y:0}
	color: color of rendered text in [0-255]. starts at {r:255, g:255, b:255, a:255}
	bitmap: character bitmap as array of pixels
	row: vertical position in rows (doesn't affect rendering)
	col: horizontal position in characters (doesn't affect rendering)
`row`, `col`, and `offset` are reset every frame
`color` and any custom properties are reset when the dialog page is changed
`bitmap` is not reset! This edits the character in the font data directly

A few helpers are provided under `window.customTextEffects` for more complex effects:
	- `saveOriginalChar`: saves the character string on `char`
	- `setBitmap`: sets bitmap based on a new character
	- `editBitmapCopy`: copies the character bitmap and runs an edit function once

The second argument is `time`, which is the time in milliseconds

A number of example effects are included
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	'my-effect': function () {
		// a horizontal wavy effect with a blue tint
		this.DoEffect = function (char, time) {
			char.offset.x += 5 * Math.sin(time / 100 + char.col / 3);
			char.color.r = 255 * Math.cos(time / 100 + char.col / 3);
		};
	},
	droop: function () {
		// causes text to droop down slowly over time
		// note that it's adding a custom property to the character if it doesn't already exist
		this.DoEffect = function (char, time) {
			char.start = char.start || time;
			char.offset.y += ((time - char.start) / 100) * Math.abs(Math.sin(char.col));
		};
	},
	fadeout: function () {
		// fades text to invisible after appearing
		this.DoEffect = function (char, time) {
			char.start = char.start || time;
			char.color.a = Math.max(0, 255 - (time - char.start) / 2);
		};
	},
	noise: function () {
		// renders noise on top of text
		// note that it's making a copy with `.slice()` since it's a dynamic bitmap change
		this.DoEffect = function (char) {
			char.bitmap = char.bitmap.slice();
			for (var i = 0; i < char.bitmap.length; ++i) {
				char.bitmap[i] = Math.random() < 0.25 ? 1 : 0;
			}
		};
	},
	strike: function () {
		// renders text with a strike-through
		// note that it's using `editBitmapCopy` since it's a static bitmap change
		this.DoEffect = function (char) {
			var font = window.fontManager.Get(window.fontName);
			var w = font.getWidth();
			var h = font.getHeight();
			window.customTextEffects.editBitmapCopy(char, function (bitmap) {
				for (var x = 0; x < w; ++x) {
					bitmap[x + Math.floor(h / 2) * w] = 1;
				}
			});
		};
	},
	scramble: function () {
		// animated text scrambling
		// note that it's saving the original character with `saveOriginalChar` so `char.original` can be used
		// it's also using `setBitmap` to render a different character in the font
		this.DoEffect = function (char, time) {
			window.customTextEffects.saveOriginalChar(char);
			if (char.original.match(/\s|\0/)) {
				return;
			}
			var c = String.fromCharCode(char.original.codePointAt(0) + ((char.col + time / 40) % 10));
			window.customTextEffects.setBitmap(char, c);
		};
	},
	rot13: function () {
		// puts letters through the rot13 cipher (see www.rot13.com)
		this.DoEffect = function (char) {
			window.customTextEffects.saveOriginalChar(char);
			var bitmap = char.original.replace(/[a-z]/, function (c) {
				return String.fromCharCode(((c.codePointAt(0) - 97 + 13) % 26) + 97);
			}).replace(/[A-Z]/, function (c) {
				return String.fromCharCode(((c.codePointAt(0) - 65 + 13) % 26) + 65);
			});
			window.customTextEffects.setBitmap(char, bitmap);
		};
	},
	sponge: function () {
		// animated alternating letter case
		// note that it's using a locally defined function
		function posmod(a, b) {
			return ((a % b) + b) % b;
		}
		this.DoEffect = function (char, time) {
			window.customTextEffects.saveOriginalChar(char);
			var c = char.original[['toUpperCase', 'toLowerCase'][Math.round(posmod(time / 1000 - (char.col + char.row) / 2, 1))]]();
			window.customTextEffects.setBitmap(char, c);
		};
	},
	flag: function () {
		// applies a wave effect that's more intense towards the ends of words
		// note that it's using function scope variables to track state across
		// multiple letters in order to figure out where words begin
		var lastSpace = 0;
		var lastCol = -Infinity;
		this.DoEffect = function (char, time) {
			window.customTextEffects.saveOriginalChar(char);
			if (char.original.match(/\s|\0/)) {
				return;
			}
			if (Math.abs(char.col - lastCol) > 1) {
				lastSpace = char.col - 1;
			}
			lastCol = char.col;
			char.offset.y -= ((char.col - lastSpace) ** 1.5) * (Math.sin(time / 120 + char.col / 2));
		};
	},
	// some common formatting effects for general use
	i: function () {
		// renders text with an italic slant
		// note that with higher steps, some characters will be cut off on the edges
		var steps = 2;
		this.DoEffect = function (char) {
			var font = window.fontManager.Get(window.fontName);
			var w = font.getWidth();
			var h = font.getHeight();
			window.customTextEffects.editBitmapCopy(char, function (bitmap) {
				for (var y = 0; y < h; ++y) {
					var o = Math.floor((y / h) * steps - steps / 2) + 1;
					for (var x = 0; x < w; ++x) {
						bitmap[x + y * w] = x + o < 0 || x + 0 >= w ? 0 : char.originalBitmap[x + o + y * w];
					}
				}
			});
		};
	},
	b: function () {
		// renders text with extra thickness
		// note that with higher weight, some characters will be cut off on the edges
		var weight = 2;
		this.DoEffect = function (char) {
			var font = window.fontManager.Get(window.fontName);
			var w = font.getWidth();
			var h = font.getHeight();
			window.customTextEffects.editBitmapCopy(char, function (bitmap) {
				for (var y = 0; y < h; ++y) {
					for (var x = 0; x < w; ++x) {
						for (var x2 = 0; x2 < weight; ++x2) {
							var x3 = x + x2 - Math.floor(weight / 2);
							if (x3 < 0 || x3 >= w) {
								continue;
							}
							bitmap[x3 + y * w] = bitmap[x3 + y * w] || char.originalBitmap[x + y * w];
						}
					}
				}
			});
		};
	},
	u: function () {
		// renders text with an underline
		this.DoEffect = function (char) {
			var font = window.fontManager.Get(window.fontName);
			var w = font.getWidth();
			var h = font.getHeight();
			window.customTextEffects.editBitmapCopy(char, function (bitmap) {
				for (var x = 0; x < w; ++x) {
					bitmap[x + (h - 1) * w] = 1;
				}
			});
		};
	},
};

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

bitsy = bitsy || /*#__PURE__*/_interopDefaultLegacy(bitsy);

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
	if (
		!kitsy.queuedInjectScripts.some(function (script) {
			return searchRegex.toString() === script.searchRegex.toString() && replaceString === script.replaceString;
		})
	) {
		kitsy.queuedInjectScripts.push({
			searchRegex: searchRegex,
			replaceString: replaceString,
		});
	} else {
		console.warn('Ignored duplicate inject');
	}
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
		queuedAfterScripts: {},
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
	reinitEngine();
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

function reinitEngine() {
	// recreate the script and dialog objects so that they'll be
	// referencing the code with injections instead of the original
	bitsy.scriptModule = new bitsy.Script();
	bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();

	bitsy.dialogModule = new bitsy.Dialog();
	bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
	bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();
}





// custom text effects are injected,
// so need to store helpers somewhere accessible
// from outside of hack scope
window.customTextEffects = {
	// helper for caching original character string on character object
	saveOriginalChar: function (char) {
		if (char.original !== undefined) {
			return;
		}
		var font = window.fontManager.Get(window.fontName);
		var characters = Object.entries(font.getData());
		var character = characters.find(function (keyval) {
			return keyval[1].toString() === char.bitmap.toString();
		});
		char.original = String.fromCharCode(character[0]);
	},
	// helper for setting new character bitmap by string on character object
	setBitmap: function (char, c) {
		char.bitmap = window.fontManager.Get(window.fontName).getChar(c);
	},
	// helper for editing bitmap without affecting other characters
	editBitmapCopy: function (char, editFn) {
		if (char.originalBitmap !== undefined) {
			return;
		}
		char.originalBitmap = char.bitmap;
		char.bitmap = char.bitmap.slice();
		editFn(char.bitmap);
	},
};

// generate code for each text effect
var functionMapCode = '';
var textEffectCode = '';
Object.entries(hackOptions).forEach(function (entry) {
	functionMapCode += 'functionMap.set("' + entry[0] + '", function (environment, parameters, onReturn) {addOrRemoveTextEffect(environment, "' + entry[0] + '");onReturn(null);});';
	textEffectCode += 'TextEffects["' + entry[0] + '"] = new (' + entry[1].toString() + ')();';
});

// inject custom text effect code
inject$1(/(var functionMap = new Map\(\);)/, '$1' + functionMapCode);
inject$1(/(var TextEffects = new Map\(\);)/, '$1' + textEffectCode);

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

}(this.hacks.custom_text_effect = this.hacks.custom_text_effect || {}, window));

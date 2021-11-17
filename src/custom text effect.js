/**
🅰
@file custom text effect
@summary make {custom}text effects{custom}
@license MIT
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
	color: palette index of rendered text. use `tileColorStartIndex`/`rainbowColorStartIndex`
	       to modify this, e.g. `tileColorStartIndex + 2` is the sprite colour
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
import bitsy from 'bitsy';
import { inject } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	'my-effect': function () {
		// a horizontal wavy effect using the blue rbw colour
		this.DoEffect = function (char, time) {
			char.offset.x += 5 * Math.sin(time / 100 + char.col / 3);
			char.color = bitsy.rainbowColorStartIndex + 4;
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
			var bitmap = char.original
				.replace(/[a-z]/, function (c) {
					return String.fromCharCode(((c.codePointAt(0) - 97 + 13) % 26) + 97);
				})
				.replace(/[A-Z]/, function (c) {
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
			char.offset.y -= (char.col - lastSpace) ** 1.5 * Math.sin(time / 120 + char.col / 2);
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
	functionMapCode += 'functionMap["' + entry[0] + '"] = function (environment, parameters, onReturn) {addOrRemoveTextEffect(environment, "' + entry[0] + '");onReturn(null);};';
	textEffectCode += 'TextEffects["' + entry[0] + '"] = new (' + entry[1].toString() + ')();';
});

// inject custom text effect code
inject(/(var functionMap = \{\};)/, '$1' + functionMapCode);
inject(/(var TextEffects = \{\};)/, '$1' + textEffectCode);

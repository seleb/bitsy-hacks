/**
🅰
@file custom text effect
@summary make {custom}text effects{custom}
@license MIT
@version 1.0.0
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
	char: character string
	row: vertical position in rows (doesn't affect rendering)
	col: horizontal position in characters (doesn't affect rendering)
`row`, `col`, and `offset` are reset every frame
`color`, `char`, and any custom properties are reset when the dialog page is changed

The second argument is `time`, which is the time in milliseconds

A number of example effects are included
*/
(function (bitsy) {
'use strict';
var hackOptions = {
	"my-effect": function () {
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
			char.offset.y += (time - char.start) / 100 * Math.abs(Math.sin(char.col));
		};
	},
	fadeout: function () {
		// fades text to invisible after appearing
		this.DoEffect = function (char, time) {
			char.start = char.start || time;
			char.color.a = Math.max(0, 255 - (time - char.start) / 2);
		};
	},
	scramble: function () {
		// animated text scrambling
		// note that it's saving the original character so it can be referenced every frame
		this.DoEffect = function (char, time) {
			char.original = char.original !== undefined ? char.original : char.char;
			if (char.original == ' ') {
				return;
			}
			char.char = String.fromCharCode(char.original.codePointAt(0) + (char.col + time / 40) % 10);
		};
	},
	rot13: function () {
		// puts letters through the rot13 cipher (see www.rot13.com)
		this.DoEffect = function (char) {
			char.original = char.original !== undefined ? char.original : char.char;
			char.char = char.original.replace(/[a-z]/, function (c) {
				return String.fromCharCode((c.codePointAt(0) - 97 + 13) % 26 + 97);
			}).replace(/[A-Z]/, function (c) {
				return String.fromCharCode((c.codePointAt(0) - 65 + 13) % 26 + 65);
			});
		};
	},
	sponge: function () {
		// animated alternating letter case
		// note that it's using a locally defined function
		function posmod(a, b) {
			return ((a % b) + b) % b;
		}
		this.DoEffect = function (char, time) {
			char.original = char.original !== undefined ? char.original : char.char;
			char.char = char.original[['toUpperCase', 'toLowerCase'][Math.round(posmod(time / 1000 - (char.col + char.row) / 2, 1))]]();
		};
	},
	flag: function () {
		// applies a wave effect that's more intense towards the ends of words
		// note that it's using function scope variables to track state across
		// multiple letters in order to figure out where words begin
		var lastSpace = 0;
		var lastCol = -Infinity;
		this.DoEffect = function (char, time) {
			if (char.char == ' ') {
				return;
			} else if (Math.abs(char.col - lastCol) > 1) {
				lastSpace = char.col - 1;
			}
			lastCol = char.col;
			char.offset.y -= Math.pow(char.col - lastSpace, 1.5) * (Math.sin(time / 120 + char.col / 2));
		};
	}
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

function flatten(list) {
	if (!Array.isArray(list)) {
		return list;
	}

	return list.reduce(function (fragments, arg) {
		return fragments.concat(flatten(arg));
	}, []);
}





// generate code for each text effect
var functionMapCode = '';
var textEffectCode = '';
for (var i in hackOptions) {
	if (hackOptions.hasOwnProperty(i)) {
		functionMapCode += 'functionMap.set("' + i + '", function (environment, parameters, onReturn) {addOrRemoveTextEffect(environment, "' + i + '");onReturn(null);});';
		textEffectCode += 'TextEffects["' + i + '"] = new (' + hackOptions[i].toString() + ')();';
	}
}

// inject custom text effect code
inject('var functionMap = new Map();', functionMapCode);
inject('var TextEffects = new Map();', textEffectCode);

// recreate the script and dialog objects so that they'll be
// referencing the code with injections instead of the original
bitsy.scriptModule = new bitsy.Script();
bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();

bitsy.dialogModule = new bitsy.Dialog();
bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();

}(window));

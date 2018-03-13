/**
🌐
@file favicon-from-sprite
@summary generate a browser favicon (tab icon) from a Bitsy sprite, including animation!
@license WTFPL (do WTF you want)
@version 2.0.0
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
Use one of your game sprites as the page favicon. It'll even animate if the
sprite has multiple frames!

HOW TO USE:
  1. Copy-paste this script into a new script tag after the Bitsy source code.
  2. Edit the configuration below to set which sprite and colors this mod
     should use for the favicon. By default, it will render the player avatar
     sprite in the first available palette's colors.
*/
(function (bitsy) {
'use strict';
var hackOptions = {
	SPRITE_NAME: '', // Sprite name as entered in editor (not case-sensitive). Defaults to player avatar.
	PALETTE_ID: 0, // Palette name or number to draw colors from. (Names not case-sensitive.)
	BG_COLOR_NUM: 0, // Favicon background color in palette. 0 = BG, 1 = Tile, 2 = Sprite.
	FG_COLOR_NUM: 2, // Favicon sprite color in palette. 0 = BG, 1 = Tile, 2 = Sprite.
	PIXEL_PADDING: 1, // Padding around sprite, in Bitsy pixel units.
	ROUNDED_CORNERS: true, // Should the favicon have rounded corners? (Suggest margin 2px if rounding.)
	FRAME_DELAY: 400 // Frame change interval (ms) if sprite is animated. Use `Infinity` to disable.
};

bitsy = bitsy && bitsy.hasOwnProperty('default') ? bitsy['default'] : bitsy;

/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@version 1.0.1
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
HOW TO USE:
  1. Paste this whole file in script tags at the bottom of your Bitsy
     exported game HTML, after the last /script> tag.
  2. Call `kitsyInit()` to make the `kitsy` object available.

CODING WITH KITSY:
  kitsy.before(targetFuncName, beforeFn)
  kitsy.after(targetFuncName, afterFn)
  kitsy.inject(searchString, codeFragment1[, ...codefragmentN])

  For more info, see the documentation at:
  https://github.com/wiki/whatever

  kitsy.before(targetFuncName, beforeFn)
    targetFuncName (string): Name of the global function you want your code
      to run before.

    beforeFn (function): A function to run. This function should take the same
      arguments as the original function.

    Use this function to register your own code to run before a Bitsy built-in
    function each time it's called. For example, if you wanted to modify Bitsy
    game data as it's loaded, you could write:

    kitsy.before('load_game', function run(game_data, startWithTitle) {
      var newGameData = game_data.replace('midnight', '12 AM');
      return [newGameData, startWithTitle];
    });

    In that example, the `run` function returns an array, so the values in the
    array will replace the parameters sent to the original `load_game`
    function. If you don't return anything, the original `load_game` will be
    called with the original `game_data, startWithTitle` parameters.

    If your `run` function is asynchronous, add an extra parameter to its
    argument list and Kitsy will provide a callback for you to signal when
    your code has finished. If you call the callback with parameters, they'll
    replace parameters to the original function as above.

    kitsy.before('load_game', function run(game_data, startWithTitle, done) {
      fetch('http://example.com')
        .then(function(response) {
          done(response.text(), startWithTitle);
        });
    });


  kitsy.after(targetFuncName, afterFn)
    targetFuncName (string): Name of the global function you want your code
      to run after.

    afterFn (function): A function to run. This function should take the same
      arguments as the original function.

    Use this function to register your own code to run after a Bitsy built-in
    function each time it's called. For example, if you wanted to pop up an
    alertbox every time the player exits a room, you could write:

    kitsy.after('onExitDialog', function run() {
      alert('Player exited.');
    });

    You might use this to clean up game state or play a sound on certain game
    events or send gameplay stats to an analytics provider.


  kitsy.inject(searchString, codeFragment1[, ...codefragmentN])
    searchString (string): A snippet of source code you want to find inside a
      script tag. Your code fragments will be inserted IMMEDIATELY after the
      end of this string, if found.

    codeFragment (string): Javascript code to inject. You can provide as many
      code fragment parameters as you want, they'll all be strung together
      before they're injected.

    Use this function to perform surgery on the Bitsy code. It's a search-and-
    insert. Use sparingly. Best used to install new dialog functions, new
    operators, or expose internal variables globally.
*/

function kitsyInit() {
	var globals = bitsy;
	var firstInit = !globals.kitsy; // check if kitsy has already been inited

	// Allow multiple copies of this script to work in one HTML file.
	globals.queuedInjectScripts = globals.queuedInjectScripts || [];
	globals.queuedBeforeScripts = globals.queuedBeforeScripts || {};
	globals.queuedAfterScripts = globals.queuedAfterScripts || [];
	globals.superFuncs = globals.superFuncs || {};
	globals.injectsDone = globals.injectsDone || false;

	// Local aliases
	var queuedInjectScripts = globals.queuedInjectScripts;
	var queuedBeforeScripts = globals.queuedBeforeScripts;
	var queuedAfterScripts = globals.queuedAfterScripts;
	var superFuncs = globals.superFuncs;
	var injectsDone = globals.injectsDone;

	globals.kitsy = {
		inject: inject,
		before: before,
		after: after
	};

	// Examples: inject('names.sprite.set( name, id );', 'console.dir(names)');
	//           inject('names.sprite.set( name, id );', 'console.dir(names);', 'console.dir(sprite);');
	//           inject('names.sprite.set( name, id );', ['console.dir(names)', 'console.dir(sprite);']);
	function inject(searchString, codeFragments) {
		var args = [].slice.call(arguments);
		codeFragments = _flatten(args.slice(1));

		queuedInjectScripts.push({
			searchString: searchString,
			codeFragments: codeFragments
		});
	}

	// Ex: before('load_game', function run() { alert('Loading!'); });
	//     before('show_text', function run(text) { return text.toUpperCase(); });
	//     before('show_text', function run(text, done) { done(text.toUpperCase()); });
	function before(targetFuncName, beforeFn) {
		queuedBeforeScripts[targetFuncName] = queuedBeforeScripts[targetFuncName] || [];
		queuedBeforeScripts[targetFuncName].push(beforeFn);
	}

	// Ex: after('load_game', function run() { alert('Loaded!'); });
	function after(targetFuncName, afterFn) {
		queuedAfterScripts[targetFuncName] = queuedAfterScripts[targetFuncName] || [];
		queuedAfterScripts[targetFuncName].push(afterFn);
	}

	// IMPLEMENTATION ============================================================
	if (firstInit) {
		var oldStartFunc = globals.startExportedGame;
		globals.startExportedGame = function doAllInjections() {
			// Only do this once.
			globals.startExportedGame = oldStartFunc;

			if (injectsDone) {
				return oldStartFunc();
			}
			globals.injectsDone = true;

			// Rewrite scripts and hook everything up.
			doInjects();
			applyAllHooks();

			// Start the game
			globals.startExportedGame.apply(this, arguments);
		};
	}

	function doInjects() {
		queuedInjectScripts.forEach(function (injectScript) {
			_inject(injectScript.searchString, injectScript.codeFragments);
		});
		_reinitEngine();
	}

	function applyAllHooks() {
		var allHooks = new Set(Object.keys(queuedBeforeScripts).concat(Object.keys(queuedAfterScripts)));
		allHooks.forEach(applyHook);
	}

	function applyHook(functionName) {
		var superFn = globals[functionName];
		var superFnLength = superFn.length;
		var functions = [];
		// start with befores
		functions = functions.concat(queuedBeforeScripts[functionName] || []);
		// then original
		functions.push(superFn);
		// then afters
		functions = functions.concat(queuedAfterScripts[functionName] || []);

		// overwrite original with one which will call each in order
		globals[functionName] = function () {
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
					var newArgs = functions[i++].apply(this, args) || args;
					runBefore.apply(this, newArgs);
				}
			}
		};
	}

	function _inject(searchString, codeToInject) {
		var args = [].slice.call(arguments);
		codeToInject = _flatten(args.slice(1)).join('');

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

	function _reinitEngine() {
		// recreate the script and dialog objects so that they'll be
		// referencing the code with injections instead of the original
		globals.scriptModule = new globals.Script();
		globals.scriptInterpreter = globals.scriptModule.CreateInterpreter();

		globals.dialogModule = new globals.Dialog();
		globals.dialogRenderer = globals.dialogModule.CreateRenderer();
		globals.dialogBuffer = globals.dialogModule.CreateBuffer();
	}

	function _flatten(list) {
		if (!Array.isArray(list)) {
			return list;
		}

		return list.reduce(function (fragments, arg) {
			return fragments.concat(_flatten(arg));
		}, []);
	}

	return globals.kitsy;
}



// CONFIGURATION FOR FAVICON

// END CONFIG

var FAVICON_SIZE = 16; // pixels
var ONE_PIXEL_SCALED = FAVICON_SIZE / bitsy.tilesize;
hackOptions.PIXEL_PADDING *= ONE_PIXEL_SCALED;
var canvas = document.createElement('canvas');
canvas.width = FAVICON_SIZE + 2 * hackOptions.PIXEL_PADDING;
canvas.height = FAVICON_SIZE + 2 * hackOptions.PIXEL_PADDING;
var ctx = canvas.getContext('2d');
var faviconLinkElem;
var faviconFrameURLs = [];
var isStarted = false;

var kitsy = kitsyInit();

kitsy.after('load_game', function () {
	if (isStarted) {
		return;
	}
	isStarted = true;

	var frameNum = 0;
	var frames = getFrames(hackOptions.SPRITE_NAME);

	faviconFrameURLs = frames.map(drawFrame);

	// Only one frame? Don't even bother with the loop, just paint the icon once.
	if (frames.length === 1) {
		updateBrowserFavicon(faviconFrameURLs[0]);
		return;
	}

	setInterval(function () {
		frameNum = ++frameNum % frames.length;
		updateBrowserFavicon(faviconFrameURLs[frameNum]);
	}, hackOptions.FRAME_DELAY);
});

function drawFrame(frameData) {
	var pal = getPalette(hackOptions.PALETTE_ID);
	var bgColor = pal && pal[hackOptions.BG_COLOR_NUM] || [20, 20, 20];
	var spriteColor = pal && pal[hackOptions.FG_COLOR_NUM] || [245, 245, 245];
	var rounding_offset = hackOptions.ROUNDED_CORNERS ? ONE_PIXEL_SCALED : 0;

	// Approximate a squircle-shaped background by drawing a fat plus sign with
	// two overlapping rects, leaving some empty pixels in the corners.
	var longSide = FAVICON_SIZE + 2 * hackOptions.PIXEL_PADDING;
	var shortSide = longSide - rounding_offset * ONE_PIXEL_SCALED;
	ctx.fillStyle = rgb(bgColor);
	ctx.fillRect(rounding_offset,
		0,
		shortSide,
		longSide);
	ctx.fillRect(0,
		rounding_offset,
		longSide,
		shortSide);

	// Draw sprite foreground.
	ctx.fillStyle = rgb(spriteColor);
	for (var y in frameData) {
		for (var x in frameData[y]) {
			if (frameData[y][x] === 1) {
				ctx.fillRect(x * ONE_PIXEL_SCALED + hackOptions.PIXEL_PADDING,
					y * ONE_PIXEL_SCALED + hackOptions.PIXEL_PADDING,
					ONE_PIXEL_SCALED,
					ONE_PIXEL_SCALED);
			}
		}
	}

	return canvas.toDataURL("image/x-icon");
}

function updateBrowserFavicon(dataURL) {
	// Add or modify favicon link tag in document.
	faviconLinkElem = faviconLinkElem || document.querySelector('#favicon');
	if (!faviconLinkElem) {
		faviconLinkElem = document.createElement('link');
		faviconLinkElem.id = 'favicon';
		faviconLinkElem.type = 'image/x-icon';
		faviconLinkElem.rel = 'shortcut icon';
		document.head.appendChild(faviconLinkElem);
	}
	faviconLinkElem.href = dataURL;
}

function getFrames(spriteName) {
	// `spriteName` is case insensitive to avoid Bitsydev headaches.
	var spriteKey = Object.keys(bitsy.sprite).find(function (key) {
		return bitsy.sprite[key].name && bitsy.sprite[key].name.toLowerCase() === spriteName.toLowerCase();
	});
	var spriteData = bitsy.sprite[spriteKey || bitsy.playerId];
	var frames = bitsy.imageStore.source[spriteData.drw];
	return frames;
}

function getPalette(id) {
	var palId = id;

	if (Number.isNaN(Number(palId))) {
		// Search palettes by name. `palette` is an object with numbers as keys. Yuck.
		// Palette names are case-insensitive to avoid Bitsydev headaches.
		palId = Object.keys(bitsy.palette).find(function (i) {
			return bitsy.palette[i].name && bitsy.palette[i].name.toLowerCase() === palId.toLowerCase();
		});
	}

	return bitsy.getPal(palId);
}

// Expects values = [r, g, b]
function rgb(values) {
	return 'rgb(' + values.join(',') + ')';
}

}(window));

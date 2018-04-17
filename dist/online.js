/**
🔄
@file online
@summary multiplayer bitsy
@license MIT
@version 1.0.0
@author Sean S. LeBlanc
@description
Provides the groundwork for running a small online multiplayer bitsy game.
Running it requires a signalling server to negotiate connections: https://github.com/seleb/web-rtc-mesh
The actual game data is sent using peer-to-peer data channels, but the server needs
to be up and running in order to make the initial connections.

HOW TO USE:
1. Copy-paste `<script src="https://<your signalling server>/Vertex.js"></script>` after the bitsy source
1. Copy-paste this script into a script tag after that
2. Edit `hackOptions.host` below to point to your server (depending on hosting, you may need to use `ws://` instead of `wss://`)
3. Edit other hackOptions as needed

If `export` is true, an API is provided in `window.online`:
	setSprite(string): updates the player avatar to match the sprite with the provided name/id, then broadcasts an update
	setDialog(string): updates the player dialog to the provided string, then broadcasts an update
	updateSprite(): broadcasts an update
	vertex: reference to the object managing connections

This hack also includes the javascript dialog hack in order to make it easy to
control the multiplayer from inside bitsy. An example of how this can be used is:
(js "online.setSprite('a'); online.setDialog('im a cat');")

Note on dialog: You can use scripting in the dialog, but it will execute on the other players' games,
accessing *their* variables. If you want to send dialog based on data in your game, you have to construct
the dialog string locally, then set it, then send an update.
*/
(function (bitsy) {
'use strict';
var hackOptions = {
	host: "wss://your signalling server",
	immediateMode: true, // if true, teleports players to their reported positions; otherwise, queues movements and lets bitsy handle the walking (note: other players pick up items like this)
	ghosts: false, // if true, sprites from players who disconnected while you were online won't go away until you restart
	export: true, // if true, `window.online` will be set to an object with an API for affecting multiplayer
	disableConsole: true // if true, sets console.log to an empty function (recommended; the logs are pretty spammy)
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

/*
Helper for getting image by name or id

Args:
	name: id or name of image to return
	 map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: the image in the given map with the given name/id
 */
function getImage(name, map) {
	var id = map.hasOwnProperty(name) ? name : Object.keys(map).find(function (e) {
		return map[e].name == name;
	});
	return map[id];
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

function flatten(list) {
	if (!Array.isArray(list)) {
		return list;
	}

	return list.reduce(function (fragments, arg) {
		return fragments.concat(flatten(arg));
	}, []);
}

/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@version 2.0.0
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
HOW TO USE:
  import {before, after, inject} from "./kitsy-script-toolkit.js";

  before(targetFuncName, beforeFn);
  after(targetFuncName, afterFn);
  inject(searchString, codeFragment1[, ...codefragmentN]);

  For more info, see the documentation at:
  https://github.com/seleb/bitsy-hacks/wiki/Coding-with-kitsy
*/


// Examples: inject('names.sprite.set( name, id );', 'console.dir(names)');
//           inject('names.sprite.set( name, id );', 'console.dir(names);', 'console.dir(sprite);');
//           inject('names.sprite.set( name, id );', ['console.dir(names)', 'console.dir(sprite);']);
function inject$1(searchString, codeFragments) {
	var kitsy = kitsyInit();
	var args = [].slice.call(arguments);
	codeFragments = flatten(args.slice(1));

	kitsy.queuedInjectScripts.push({
		searchString: searchString,
		codeFragments: codeFragments
	});
}

// Ex: before('load_game', function run() { alert('Loading!'); });
//     before('show_text', function run(text) { return text.toUpperCase(); });
//     before('show_text', function run(text, done) { done(text.toUpperCase()); });
function before(targetFuncName, beforeFn) {
	var kitsy = kitsyInit();
	kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
	kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
}

// Ex: after('load_game', function run() { alert('Loaded!'); });
function after(targetFuncName, afterFn) {
	var kitsy = kitsyInit();
	kitsy.queuedAfterScripts[targetFuncName] = kitsy.queuedAfterScripts[targetFuncName] || [];
	kitsy.queuedAfterScripts[targetFuncName].push(afterFn);
}

function kitsyInit() {
	// return already-initialized kitsy
	if (bitsy.kitsy) {
		return bitsy.kitsy;
	}

	// Initialize kitsy
	bitsy.kitsy = {
		inject: inject$1,
		before: before,
		after: after,
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
		inject(injectScript.searchString, injectScript.codeFragments);
	});
	_reinitEngine();
}

function applyAllHooks() {
	var allHooks = unique(Object.keys(bitsy.kitsy.queuedBeforeScripts).concat(Object.keys(bitsy.kitsy.queuedAfterScripts)));
	allHooks.forEach(applyHook);
}

function applyHook(functionName) {
	var superFn = bitsy[functionName];
	var superFnLength = superFn.length;
	var functions = [];
	// start with befores
	functions = functions.concat(bitsy.kitsy.queuedBeforeScripts[functionName] || []);
	// then original
	functions.push(superFn);
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
				var newArgs = functions[i++].apply(this, args) || args;
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

/**
☕
@file javascript dialog
@summary execute arbitrary javascript from dialog
@license MIT
@version 1.0.0
@requires Bitsy Version: 4.5, 4.6
@author Sean S. LeBlanc

@description
Lets you execute arbitrary JavaScript from dialog (including inside conditionals).
If you're familiar with the Bitsy source, this will let you write one-shot hacks
for a wide variety of situations.

Usage: (js "<JavaScript code to evaluate>")

Examples:
	move a sprite:
	(js "sprite['a'].x = 10;")
	edit palette colour:
	(js "getPal(curPal())[0] = [255,0,0];renderImages();")
	place an item next to player:
	(js "room[curRoom].items.push({id:'0',x:player().x+1,y:player().y});")
	verbose facimile of exit-from-dialog:
	(js "var _onExitDialog=onExitDialog;onExitDialog=function(){player().room=curRoom='3';_onExitDialog.apply(this,arguments);onExitDialog=_onExitDialog;};")

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Add (js "<code>") to your dialog as needed

NOTE: This uses parentheses "()" instead of curly braces "{}" around function
      calls because the Bitsy editor's fancy dialog window strips unrecognized
      curly-brace functions from dialog text. To keep from losing data, write
      these function calls with parentheses like the examples above.

      For full editor integration, you'd *probably* also need to paste this
      code at the end of the editor's `bitsy.js` file. Untested.
*/

// Hook into game load and rewrite custom functions in game data to Bitsy format.
before("load_game", function (game_data, startWithTitle) {
	// Rewrite custom functions' parentheses to curly braces for Bitsy's
	// interpreter. Unescape escaped parentheticals, too.
	var fixedGameData = game_data
	.replace(/(^|[^\\])\((.*? ".+?")\)/g, "$1{$2}") // Rewrite (...) to {...}
	.replace(/\\\((.*? ".+")\\?\)/g, "($1)"); // Rewrite \(...\) to (...)
	return [fixedGameData, startWithTitle];
});

// Rewrite the Bitsy script tag, making these new functions callable from dialog.
inject$1(
	"var functionMap = new Map();",
	"functionMap.set('js', " + function (environment, parameters, onReturn) {
		eval(parameters[0]);
		onReturn(null);
	}.toString() + ");"
);

/**
@file edit image at runtime
@summary API for updating image data at runtime.
@author Sean S. LeBlanc
@description
Adds API for updating sprite, tile, and item data at runtime.

Individual frames of image data in bitsy are 8x8 1-bit 2D arrays in yx order
e.g. the default player is:
[
	[0,0,0,1,1,0,0,0],
	[0,0,0,1,1,0,0,0],
	[0,0,0,1,1,0,0,0],
	[0,0,1,1,1,1,0,0],
	[0,1,1,1,1,1,1,0],
	[1,0,1,1,1,1,0,1],
	[0,0,1,0,0,1,0,0],
	[0,0,1,0,0,1,0,0]
]
*/

/*
Args:
	   id: string id or name
	frame: animation frame (0 or 1)
	  map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: a single frame of a image data
*/
function getImageData(id, frame, map) {
	return bitsy.imageStore.source[getImage(id, map).drw][frame];
}

function getSpriteData(id, frame) {
	return getImageData(id, frame, bitsy.sprite);
}

/*
Updates a single frame of image data

Args:
	     id: string id or name
	  frame: animation frame (0 or 1)
	    map: map of images (e.g. `sprite`, `tile`, `item`)
	newData: new data to write to the image data
*/
function setImageData(id, frame, map, newData) {
	var drawing = getImage(id, map);
	var drw = drawing.drw;
	bitsy.imageStore.source[drw][frame] = newData;
	if (drawing.animation.isAnimated) {
		drw += "_" + frame;
	}
	for (var pal in bitsy.palette) {
		if (bitsy.palette.hasOwnProperty(pal)) {
			var col = drawing.col;
			var colStr = "" + col;
			bitsy.imageStore.render[pal][colStr][drw] = bitsy.imageDataFromImageSource(newData, pal, col);
		}
	}
}

function setSpriteData(id, frame, newData) {
	setImageData(id, frame, bitsy.sprite, newData);
}





if (hackOptions.disableConsole) {
	console.log = function () {}; //eslint-disable-line
}

if (!window.Vertex) {
	alert("Couldn't connect to server!");
	throw new Error("Couldn't connect to server");
}
var vertex;

// map of dataChannel ids to sprite ids
var peers = new Map(); // eslint-disable-line

after("startExportedGame", function () {
	vertex = new window.Vertex.default({
		host: hackOptions.host,
		onClose: function (event) {
			const p = peers.get(event.target);
			peers.delete(event.target);
			if (!hackOptions.ghosts) {
				delete bitsy.sprite[p];
			}
		},
		onData: function (event) {
			var spr;
			var data = JSON.parse(event.data);
			if (data.from) {
				peers.set(event.target, data.from);
			}
			if (data.e === "move") {
				spr = bitsy.sprite[data.from];
				if (spr) {
					// move sprite
					if (hackOptions.immediateMode) {
						// do it now
						spr.x = data.x;
						spr.y = data.y;
						spr.room = data.room;
					} else {
						// let bitsy handle it later
						spr.walkingPath.push({
							x: data.x,
							y: data.y
						});
					}
				} else {
					// got a move from an unknown player,
					// so ask them who they are
					vertex.send(data.from, {
						e: "gimmeSprite",
						from: vertex.id
					});
				}
			} else if (data.e === "gimmeSprite") {
				// send a sprite update to specific peer
				vertex.send(data.from, getSpriteUpdate());
			} else if (data.e === "sprite") {
				// update a sprite
				var longname = "SPR_" + data.from;
				spr = bitsy.sprite[data.from] = {
					animation: {
						frameCount: data.data.length,
						frameIndex: 0,
						isAnimated: data.data.length > 1
					},
					col: data.col,
					dlg: longname,
					drw: longname,
					inventory: {},
					name: data.from,
					walkingPath: [],
					x: data.x,
					y: data.y,
					room: data.room
				};
				bitsy.dialog[longname] = data.dlg;
				bitsy.imageStore.source[longname] = data.data;

				for (var frame = 0; frame < data.data.length; ++frame) {
					setSpriteData(data.from, frame, data.data[frame]);
				}
			}
		}
	});

	if (hackOptions.export) {
		window.online = {
			vertex: vertex,
			updateSprite: updateSprite,
			setSprite: function (spr) {
				var p = bitsy.player();
				var t = getImage(spr, bitsy.sprite);
				p.animation = {
					frameCount: t.animation.frameCount,
					isAnimated: t.animation.isAnimated,
					frameIndex: 0
				};
				p.col = t.col;
				for (var i = 0; i < p.animation.frameCount; ++i) {
					setSpriteData(bitsy.playerId, i, getSpriteData(spr, i));
				}
				updateSprite();
			},
			setDialog: function (str) {
				bitsy.dialog[bitsy.player().dlg] = str;
				updateSprite();
			}
		};
	}
});

after("movePlayer", moveSprite);
after("onready", function () {
	// tell everyone who you are
	// and ask who they are 1s after starting
	setTimeout(function () {
		if (vertex) {
			updateSprite();
			vertex.broadcast({
				e: "gimmeSprite",
				from: vertex.id
			});
		}
	}, 1000);
});

// tell everyone where you are
function moveSprite() {
	var p = bitsy.player();
	vertex.broadcast({
		e: "move",
		x: p.x,
		y: p.y,
		room: p.room,
		from: vertex.id
	});
}

// tell everyone who you are
function updateSprite() {
	vertex.broadcast(getSpriteUpdate());
}

// helper to create a sprite update based on the player avatar
function getSpriteUpdate() {
	var p = bitsy.player();
	return {
		e: "sprite",
		from: vertex.id,
		data: bitsy.imageStore.source[p.drw],
		x: p.x,
		y: p.y,
		room: p.room,
		dlg: bitsy.dialog[p.dlg],
		col: p.col
	};
}

}(window));

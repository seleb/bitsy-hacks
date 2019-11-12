/**
➡
@file push sprites
@summary sokoban-style sprite pushing
@license MIT
@version 1.0
@requires 5.3
@author janosc

@description
Hack to make sprites pushable.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit hackOptions below to specify the push logic, exit handling, target states and whether to flip drawings

PUSH LOGIC:
functions to determine:
  1. the sprites that the player can push
  2. the sprites that a pushed sprite can push
  3. the items that stop a sprite from moving
  4. the tiles that stop a sprite from moving

EXIT HANDLING:
function to determine whether a sprite will be allowed to transit an exit

TARGET STATES:
object specifying which dialogs to trigger and under what conditions

SPRITE FLIPPING:
allow or disallow drawing flips when a sprite is pushed

*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {

  // PUSH LOGIC

  playerPushesSprite: function (spr) {
		//return spr.name == 'cat'; // specific pushable sprite
		//return ['cat', 'dog', 'bird'].indexOf(spr.name) !== -1; // specific pushable sprite list
		//return spr.name && spr.name.indexOf('PUSHABLE') !== -1; // pushable flag in sprite name
    //if(!spr.name) return true; else return spr.name.indexOf('IMMOVABLE') == -1; // immovable flag in sprite name
		return true; // all sprites are pushable by player
	},

  spritePushesSprite: function (spr1,spr2) {
    return false; // sprites can't push other sprites
    //return spr1.name == 'dog'; // specific pushing sprite
    //return spr1.name == 'dog' && spr2.name == 'sheep'; // specific pair of pushing/pushable sprites
    //return ['dog', 'cat', 'horse'].indexOf(spr1.name) !== -1; // specific pushing sprite list
    //return spr1.name && spr1.name.indexOf('PUSHING') !== -1; // pushing flag in sprite name
    //return spr2.name && spr2.name.indexOf('PUSHABLE') !== -1; // pushable flag in sprite name
    //return true; // all sprites can push all other sprites
  },

  itemStopsSprite: function (itm,spr) {
    //return false; // no items are stopping
    //return itm.name == 'cup'; // specific stopping item
    //return ['cup', 'flower', 'hat'].indexOf(itm.name) !== -1; // specific stopping item list
    //return itm.name && itm.name.indexOf('STOPPING') !== -1; // stopping flag in item name
    return true; // all items are stopping
  },

  tileStopsSprite: function (til,spr) {
    //return false; // no tiles are stopping
    //return til.name == 'tree'; // specific stopping tile
    //return ['tree', 'bush', 'pond'].indexOf(til.name) !== -1; // specific stopping tile list
    //return til.name && til.name.indexOf('STOPPING') !== -1; // stopping flag in tile name
    return til.isWall; // all walls are stopping
    //if(til.name && til.name.indexOf('NONSTOPPING') !== -1) return false; else return til.isWall; // some walls are not stopping
    //return true; // all tiles are stopping
  },


  // EXIT HANDLING

  spriteCanExit: function (spr,ext){
    //return false; // sprites can't be pushed through exits
    //return spr.name == 'cat'; // specific exiting sprite
    //return ['cat', 'dog', 'chicken'].indexOf(spr.name) !== -1; // specific exiting sprite list
    //return spr.name && spr.name.indexOf('EXITS') !== -1; // exiting flag in sprite name
    //return ['1','2'].indexOf(spr.room) !== -1; // specific exiting room list
    //return ['10','11'].indexOf(ext.dest.room) !== -1; // specific destination room list
    return true; // all sprites can use all exits
  },


  // TARGET STATES

  //
  // Target conditions for triggering dialogs.
  //
  // Each property of `conditions` sets up a trigger for a potential pair of dialogs,
  // `dialog_stem_true` and `dialog_stem_false`, which will be called after each player
  // move, depending on whether the condition is satisfied or not.
  //
  // Each condition consists of a set of sprite_conditions, which must all be
  // satisfied for the condition to become TRUE.
  //
  // A sprite_condition consists of a sprite_stem and an OR_list.
  // The sprite_stem specifies the subset of sprites that will be acceptable on the targets:
  // 'anything','nothing', or a substring with which the sprite name must start.
  //
  // An OR_list specifies a set of AND_lists, any of which can evaluate to TRUE.
  //
  // An AND_list specifies a set of targets, all of which must be covered by a suitable sprite.
  //
  // Redundant brackets can be omitted to simplify notation, e.g.
  // [r,x,y] => a single target
  // [[r1,x1,y1],[r2,x2,y2]] => an AND_list: all of these targets must be covered
  // [[[r1,x1,y1]],[[r2,x2,y2],[r3,x3,y3]]] => an OR_list: target_1 || (target_2 && target_3)
  //
  // In summary:
  //
  // conditions <- {condition, (condition,...)}
  // condition <- 'dialog_stem': sprite_conditions
  // sprite_conditions <- {sprite_condition, (sprite_condition,...)}
  // sprite_condition <- 'sprite_stem': OR_list
  // OR_list <- [AND_list, (AND_list,...)] | AND_list
  // AND_list <- [target, [target,...] ] | target
  // target <- [room,x,y]
  //
  conditions: {
    'cover_bases':{
      'anything':[[0,5,10],[0,7,10],[0,9,10]]
    },
    'perfect_match':{
      'bell':[1,9,5],
      'book':[1,9,7],
      'candle':[1,9,9]
    },
    'intruder_detect':{
      'nothing':[[2,3,6],[2,3,7],[2,3,8]]
    },
    'diagonal_alternatives':{
      'rock':[[[3,7,9],[3,8,10]],[[3,7,10],[3,8,9]]]
    }
  },


  // SPRITE FLIPPING

  // If `horizontalFlipsAllowed` is true:
  // 	pushing left will make a sprite face backwards
  // 	pushing right will make a sprite face forwards
  horizontalFlipsAllowed: false,

  // If `verticalFlipsAllowed` is true:
  // 	pushing down will make a sprite upside-down
  // 	pushing up will make a sprite right-side up
  verticalFlipsAllowed: false,


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

/*
Helper for getting image by name or id

Args:
	name: id or name of image to return
	 map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: the image in the given map with the given name/id
 */
function getImage(name, map) {
	var id = Object.prototype.hasOwnProperty.call(map, name) ? name : Object.keys(map).find(function (e) {
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

/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@version 4.0.1
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
			} else {
				// run synchronously
				returnVal = functions[i++].apply(this, args);
				if (returnVal && returnVal.length) {
					args = returnVal;
				}
				return runBefore.apply(this, args);
			}
		}

		return runBefore.apply(this, arguments);
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
@file transform sprite data
@summary Helpers for flipping and rotating sprite data
*/

// copied from https://stackoverflow.com/a/46805290
function transpose(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const grid = [];
  for (let j = 0; j < cols; j++) {
    grid[j] = Array(rows);
  }
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[j][i] = matrix[i][j];
    }
  }
  return grid;
}

// helper function to flip sprite data
function transformSpriteData(spriteData, v, h, rot) {
	var x, y, x2, y2, col, tmp;
	var s = spriteData.slice();
	if (v) {
		for (y = 0; y < s.length / 2; ++y) {
			y2 = s.length - y - 1;
			tmp = s[y];
			s[y] = s[y2];
			s[y2] = tmp;
		}
	}
	if (h) {
		for (y = 0; y < s.length; ++y) {
			col = s[y] = s[y].slice();
			for (x = 0; x < col.length / 2; ++x) {
				x2 = col.length - x - 1;
				tmp = col[x];
				col[x] = col[x2];
				col[x2] = tmp;
			}
		}
	}
	if (rot) {
		s = transpose(s);
	}
	return s;
}

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
	return bitsy.renderer.GetImageSource(getImage(id, map).drw)[frame];
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
	var img = bitsy.renderer.GetImageSource(drw).slice();
	img[frame] = newData;
	bitsy.renderer.SetImageSource(drw, img);
}

function setSpriteData(id, frame, newData) {
	setImageData(id, frame, bitsy.sprite, newData);
}






before('movePlayer', function(direction) {

  var spriteId = null;
  if(direction == bitsy.Direction.Left) spriteId = getSpriteLeft();
  else if(direction == bitsy.Direction.Right) spriteId = getSpriteRight();
  else if(direction == bitsy.Direction.Up) spriteId = getSpriteUp();
  else if(direction == bitsy.Direction.Down) spriteId = getSpriteDown();

  if(spriteId && hackOptions.playerPushesSprite(sprite[spriteId])){
    var success = pushSprite(sprite[spriteId],direction);
    if(!success) updateImage(sprite[spriteId]);  // to flip the sprite even if it doesn't move
  }

});


//
// push handling
//

function pushSprite(spr,direction){
	var sprs;
  var newx,newy;

  switch (direction) {
	case bitsy.Direction.Up:
      newx = spr.x;
      newy = spr.y-1;
		break;
	case bitsy.Direction.Down:
    newx = spr.x;
    newy = spr.y+1;
		break;
	case bitsy.Direction.Left:
    newx = spr.x-1;
    newy = spr.y;
		break;
	case bitsy.Direction.Right:
    newx = spr.x+1;
    newy = spr.y;
		break;
	default:
		break;
	}

	if(moveOK(spr,newx,newy,direction)){
		sprs = getAllSpritesAt(spr.room, spr.x, spr.y);
		sprs.forEach(function(s){
      updateImage(s);
      s.x = newx;
      s.y = newy;
    });
    checkExit(spr,direction);
		return true;
	}
  return false;
}


function moveOK(spr,newx,newy,direction){
  var next = getFirstSpriteAt(spr.room,newx,newy);
  // either there is a space or the next sprite moves
  return (!next && itemOK(spr,newx,newy) && tileOK(spr,newx,newy) ) ||
           (next && spriteOK(spr,next) && pushSprite(next,direction));
}

function spriteOK(spr1,spr2){
    return hackOptions.spritePushesSprite(spr1,spr2);
}

function itemOK(spr,x,y){
    var items = room[spr.room].items;
    if(items.length>0) {
      for(var itm of items){
        if(hackOptions.itemStopsSprite(item[itm.id],spr) && itm.x == x && itm.y == y) return false;
      }
    }
  return true;
}

function tileOK(spr,x,y){
    if(x<0 || y<0 || x>=mapsize || y >= mapsize) return false;  // can't push sprite off the edge
    var tileid = room[spr.room].tilemap[y][x];
    if(tileid === '0') return true;  // no tile => no problem
    if(hackOptions.tileStopsSprite(tile[tileid],spr)) return false;
    return true;
}

function getFirstSpriteAt(r,x,y) {
	for (id in sprite) {
		var spr = sprite[id];
		if (spr.room === r) {
			if (spr.x == x && spr.y == y) {
				return spr;
			}
		}
	}
  return null;
}

function getAllSpritesAt(r,x,y) {
	var sprs = [];
	for (id in sprite) {
		var spr = sprite[id];
		if (spr.room === r) {
			if (spr.x == x && spr.y == y) {
				sprs.push(spr);
			}
		}
	}
  return sprs;
}


//
// exit handling
//

function checkExit(spr, direction){
  var i;
  var source = spr.room;
  for(i in room[source].exits){
    var ext = room[source].exits[i];
    if(spr.x == ext.x && spr.y == ext.y){

      // move sprite through exit to the destination
      spr.room = ext.dest.room;
      spr.x = ext.dest.x;
      spr.y = ext.dest.y;

      // try to push one cell in same direction
      var success = pushSprite(spr,direction);

      // if it succeeds, move any remaining sprites across to join it
      var sprs = getAllSpritesAt(source, ext.x, ext.y);
      sprs.forEach(function(s){
        s.room = spr.room;
        s.x = spr.x;
        s.y = spr.y;
      });

      // if it fails, sprite cannot transit so move it back
      if(!success){
        spr.room = source;
        spr.x = ext.x;
        spr.y = ext.y;
      }
    }
  }
}

//
// target handling
//

var targetsLookup;

function checkTargets(){
  var spr,k,s;
  targetsLookup = [];
  for(var id in sprite){
    spr = sprite[id];
    if (spr.name){
      if(!targetsLookup[spr.room]) targetsLookup[spr.room] = [];
      if(!targetsLookup[spr.room][spr.x]) targetsLookup[spr.room][spr.x] = [];
      targetsLookup[spr.room][spr.x][spr.y] = spr.name;
    }
  }
  if(!targetsLookup[curRoom]) targetsLookup[curRoom] = [];
  if(!targetsLookup[curRoom][player().x]) targetsLookup[curRoom][player().x] = [];
  targetsLookup[curRoom][player().x][player().y] = 'A';

  for(k in hackOptions.conditions){
    var result = true;
    for(s in hackOptions.conditions[k]){
      if(hackOptions.conditions[k][s] instanceof Array){
        if(hackOptions.conditions[k][s][0] instanceof Array){
          if(hackOptions.conditions[k][s][0][0] instanceof Array){
            result = result && checkOR(s,hackOptions.conditions[k][s]);
          }
          else{
            result = result && checkAND(s,hackOptions.conditions[k][s]);
          }
        }
        else{
          result = result && check(s,hackOptions.conditions[k][s]);
        }
      }
    }
    var dialogId;
    if(result) dialogId = k + "_true";
    else dialogId = k + "_false";

    if(dialog[dialogId]){
        console.log("triggered " + dialogId);
    		var dialogStr = dialog[dialogId];
    		startDialog(dialogStr,dialogId);
    }
  }

}

after('movePlayer', function(direction){
//  if(!isNarrating && didPlayerMoveThisFrame) checkTargets();
//    console.log(isDialogMode);
    if(!isNarrating && !isDialogMode) checkTargets();
});

function check(s,xyz){
  if(s === 'nothing'){
    return targetsLookup[xyz[0]] === undefined ||
      targetsLookup[xyz[0]][xyz[1]] === undefined ||
      targetsLookup[xyz[0]][xyz[1]][xyz[2]] === undefined;
  }
  return targetsLookup[xyz[0]] &&
    targetsLookup[xyz[0]][xyz[1]] &&
    targetsLookup[xyz[0]][xyz[1]][xyz[2]] &&
    isCompatible(s,targetsLookup[xyz[0]][xyz[1]][xyz[2]]);
}

function checkAND(s,xyzs){
  var result = true;
  for(var xyz of xyzs){
    result = result && check(s,xyz);
    if(!result) return false;
  }
  return true;
}

function checkOR(s,xyzss){
  for(var xyzs of xyzss){
    if(checkAND(s,xyzs)) return true;
  }
  return false;
}

function isCompatible(p,q){
  if(p === "anything") return true;
  if(p === "A") return (q === "A");
  return q.startsWith(p);
}


//
// sprite flipping
//

var originalAnimations = [];
var hflips = [];
var vflips = [];


before("onready",function(){
  var i;
  for(id in sprite){
    var spr = sprite[id];

    originalAnimations[spr.id] = {
      frames: []
    };
    for (i = 0; i < spr.animation.frameCount; ++i) {
      originalAnimations[spr.id].frames.push(getSpriteData(spr.id, i));
    }

    hflips[spr.id] = false;
    vflips[spr.id] = false;
  }
});


function updateImage(spr){

  // determine which directions need flipping
	switch (bitsy.curPlayerDirection) {
	case bitsy.Direction.Up:
		if(hackOptions.verticalFlipsAllowed) vflips[spr.id] = false;
		break;
	case bitsy.Direction.Down:
	  if(hackOptions.verticalFlipsAllowed) vflips[spr.id] = true;
		break;
	case bitsy.Direction.Left:
    if(hackOptions.horizontalFlipsAllowed) hflips[spr.id] = true;
		break;
	case bitsy.Direction.Right:
    if(hackOptions.horizontalFlipsAllowed) hflips[spr.id] = false;
		break;
	default:
		break;
	}

  // update sprite with flipped frames
  for (i = 0; i < originalAnimations[spr.id].frames.length; ++i) {
    setSpriteData(spr.id, i, transformSpriteData(originalAnimations[spr.id].frames[i], vflips[spr.id], hflips[spr.id]));
  }
  originalAnimations[spr.id].referenceFrame = getSpriteData(spr.id, 0);

}

exports.hackOptions = hackOptions;

}(this.hacks['push-sprites'] = this.hacks['push-sprites'] || {}, window));

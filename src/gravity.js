/**
🍂
@file gravity
@summary Pseudo-platforming/gravity/physics
@license MIT
@version 1.0.0
@requires 6.3
@author Cole Sea

@description
Overrides Bitsy movement logic to simulate "gravity".

Features
- Treats walls and sprites as "solid" objects that can be stood on
- Does not allow player to move upwards unless they are on a climbable tile or
jump/jetpack/force are activated
- Does not allow player to move horizontally unless they are standing on a
wall or sprite or climbable/standable tile
- Forces player to "fall" any time they are not on a wall or sprite
- Restricts how much the player can move horizontally while falling
- Calculates fall damage any time the player lands on a wall or sprite
- All invalid movement inputs (i.e, moving into a wall, pressing up while falling)
are converted into down presses

Dialog Tags

- (toggleGravity) Toggle gravity on/off
- (setJumpPower "NUM") Sets how many tiles the player can jump straight up.
Replace NUM with a whole number (setJumpPower "1"). JumpPower is refreshed every time
they player lands on the ground.
- (toggleJetpack) Allows player to "jetpack"/jump upwards while already in the air.
Player is still limited by how much JumpPower they have.
- (forceGravity "DIRECTION") Forces the player to move in the given DIRECTION until
they hit something. Replace DIRECTION with "up", "down", "left", or "right".
- (invertGravity "DIRECTION") Makes gravity flow in DIRECTION.
Replace DIRECTION with "up", "down", "left", or "right".

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit hackOptions below as desired
3. Use the dialog tags in your game to alter settings
*/
import bitsy from "bitsy";
import {
  after, before, addDualDialogTag, inject
} from "./helpers/kitsy-script-toolkit";

import {
  getSpriteData,
  setSpriteData
} from "./helpers/edit image at runtime";


export var hackOptions = {
  // Configure whether or not gravity should be active when the game starts.
  // Use the `toggleGravity` dialog tag to turn it on/off
  activeOnLoad: true,

  // Configure how much JumpPower the player has after landing
  // Leave this set to 1 and player can jump 1 tile high any time they are on the ground
  // Set this to 0 for no jumping (only falling?)
  // Player can only jump straight up from a solid object, they cannot jump while
  // falling or after moving horizontally (unless `jetpack` is active)
  jumpPower: 0,

  // If true, then the player can jump while falling/in mid-air
  // Player is still restricted by the amount of JumpPower they have left,
  // which does not replenish until they land on a solid object
  jetpack: false,

  // Configure which tiles are "climbable".
  // Player will be able to move upward while standing on those tiles.
  // Useful for making ladders, ropes, trampolines, etc.
  isClimbable: function (tile) {
    return tile.name.indexOf('CLIMB') !== -1; // climbable tile flag in name
    //return tile.name == 'ladder'; // specific climbable tile
    //return ['ladder', 'rope', 'trampoline'].indexOf(tile.name) !== -1; // specific climbable tile list
  },

  // Configure which tiles are "standable".
  // Player will be able to walk horizontally across this tile even if it's not a wall/sprite.
  // Useful for making a ladder/rope that connect to a standable surface at it's top.
  isStandable: function (tile) {
    return tile.name.indexOf('STAND') !== -1; // standable tile flag in name
    //return tile.name == 'ledge'; // specific standable tile
    //return ['ledge', 'overhang', 'trapdoor'].indexOf(tile.name) !== -1; // specific standable tile list
  },

  // If true, player avatar will be rotated whenever the gravity is inverted
  flipAvatarOnInversion: true,

  // Runs any time the player "lands" on something solid,
  // `tilesFallen` is the number of tiles they fell.
  // Grabbing a ladder or using the "jetpack" will reset the fall counter.
  // If you don't want any fall damage, leave this function empty
  // Contains examples for decreasing a variable or ending the game
  fallDamage: function (tilesFallen) {
		console.log('landed', tilesFallen)
    // // Decrease a variable in your game called `health`
    // var health = bitsy.scriptInterpreter.GetVariable('health');
    // bitsy.scriptInterpreter.SetVariable('health', ~~health - tilesFallen);

    // // or maybe just end the game if the fall was high enough?
    // if (tilesFallen > 5) {
      // bitsy.dialogBuffer.EndDialog();
      // bitsy.startNarrating('YOU DIED!', true);
    // }
  },

  // Controls how much the player can move horizontally during a single "fall"
  // For each move in a fall, this ratio must be less than (<) the max:
  // (number of tiles moved horizontally) / (total number of tiles moved)
  // Set this to 0 to be unable to move horizontally while falling
  // Set this to 0.5 and player can move horizontally every other move while falling
  // Set this to 1 to always be able to move horizontally while falling
  maxHorizontalFallingRatio: 0.51,
};

/* GLOBAL VARS
*/

var active = hackOptions.activeOnLoad;
var wasStandingOnSomething = false;
var wasClimbing = false; //
var isOnClimbableTile = false; //
var isClimbing = false; //
var fallCounter = 0; // how many tiles player has been falling for
var horizontalFallingMoves = 0; // how many times player has moved horizontally during current fall
var gravityDir = 'down'; // which arrow key does the user press to move downward relative to gravity
var lastMoveMapped = 'down'; // last direction that the player moved in (relative to gravity)
var forceGravityDir = undefined; // if played is being forced, this is the direction they are being pushed in
var wasJetpacking = false; // whether or not player used any jumpPower on their last move
var jumpPower = hackOptions.jumpPower; // how many tiles the player can jump upwards
var jetpack = hackOptions.jetpack; // player can start a jump only when they are standing on the ground. if false, player can "jetpack" anywhere anytime
var originalAnimation; // caches player avatar for use in rotation logic

// various constants for translating user movement into current gravity.
// there's probably some programmatic way to handle all this but...eh....
var gravityMap = {
   // "normal" gravity
  down: {up: 'up', down: 'down', left: 'left', right: 'right' },
  // inverted
  up: { up: 'down', down: 'up',  left: 'left', right: 'right' },
  // right is the floor
  right: { up: 'left', down: 'right', left: 'up', right: 'down' },
  // left is the floor
  left: { up: 'right', down: 'left', left: 'down', right: 'up' }
}
var lr = ['left',  'right'];
var ud = ['up',  'down'];
var dirs = ['up', 'down', 'left', 'right'];
var offsets = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [0, 1],
}

/* THE MAGIC
*/

after("onPlayerMoved", function () {
  if (!active) return;
  var player = bitsy.player();

  wasStandingOnSomething = isSolid(gravityDir, player.x, player.y);

  // if player is standing on something and has a fallCounter > 0, then they just landed
  if (wasStandingOnSomething && fallCounter && hackOptions.fallDamage) hackOptions.fallDamage(fallCounter);
})

before("movePlayer", function () {
  if (!active) return;
  var player = bitsy.player();

  wasStandingOnSomething = isSolid(gravityDir, player.x, player.y);

  if (wasStandingOnSomething) {
    // reset jetpack fuel
    jumpPower = hackOptions.jumpPower;
  }

  wasClimbing = isClimbing;
  isOnClimbableTile = isTileClimbable(player.x, player.y);

  if (wasStandingOnSomething || isClimbing || wasJetpacking || forceGravityDir) {

    // reset fall counters
    fallCounter = 0;
    horizontalFallingMoves = 0;
  } else {
    // player is falling
    fallCounter += 1;
  }



  if (forceGravityDir && isSolid(forceGravityDir, player.x, player.y)) {
    // if played was being pushed, and hit a wall in that direction, turn off the push
    forceGravityDir = undefined;
  }

});


window.advanceGravity = function () {
  if (!active) return;
  var player = bitsy.player();
  // player input something, but could not move.

  // force them up if they are doing that
  if (forceGravityDir) {
    reallyMovePlayer(player, forceGravityDir)
    lastMoveMapped = forceGravityDir;
    return;
  }

  if (isOnStandableTile(player)) return;

  // otherwise:force them downward if possible.
  reallyMovePlayer(player, gravityDir);
  lastMoveMapped = 'down';
}

window.movePlayerWithGravity = function (dir, axis, amt) {
  var player = bitsy.player();
  if (!active) {
    player[axis] += amt;
    return;
  }

  // if player is being pushed, just push em and skip everything else
  if (forceGravityDir) {
    reallyMovePlayer(player, forceGravityDir)
    lastMoveMapped = forceGravityDir;
    return;
  }

  // dir is the arrow pressed. realDir is what that arrow translates to in the current gravity inversion...
  var realDir = mapDir(dir)
  var horizontal = realDir === 'left' || realDir === 'right';

  var canJetpack = !!jumpPower;
  // if set to jetpack false, only let them jump if they are standing on something or used jetpack last move
  if (!jetpack && !wasStandingOnSomething && !wasJetpacking) canJetpack = false

// reset vars and stuff
  wasJetpacking = false;
  isClimbing = false;

  // THE BIG MAMA
  if (realDir === 'up' && (isOnClimbableTile || canJetpack)) {

    if (!isOnClimbableTile) {
      // if yr moving up, and yr not climbing, then u must be jumping/jetpacking
      wasJetpacking = true;
      jumpPower -= 1;
    } else {
      isClimbing = true
    }
    reallyMovePlayer(player, dir)
    lastMoveMapped = realDir;

  } else if (horizontal && (wasStandingOnSomething || wasClimbing || isOnClimbableTile || isOnStandableTile(player, dir))){

  // u can always move horizontally if yr standing on smth
    reallyMovePlayer(player, dir);
    lastMoveMapped = realDir;

  } else if (horizontal && canMoveHorizontallyWhileFalling()){

    // u can sometimes move horizontally while falling
    reallyMovePlayer(player, dir);
    lastMoveMapped = realDir;
    horizontalFallingMoves += 1;

  } else if (!wasStandingOnSomething) {

    // if none of the other options are valid, and they are falling, then make em fall!
    reallyMovePlayer(player, gravityDir);
    lastMoveMapped = 'down';

  } else {
    // TODO: DIS WHAT HAPPENS WHEN YR STANDING ON THE EDGE!
  }
}

// DANGER!

// BRITTLE CODE
inject(/player\(\)\.x -= 1;/, "movePlayerWithGravity('left', 'x', -1);");
inject(/player\(\)\.x \+= 1;/, "movePlayerWithGravity('right', 'x', 1);");
inject(/player\(\)\.y -= 1;/, "movePlayerWithGravity('up', 'y', -1);");
inject(/player\(\)\.y \+= 1;/, "movePlayerWithGravity('down', 'y', 1);");

// EXTREMELY BRITTLE CODE
inject(/var ext = getExit\( player\(\)\.room, player\(\)\.x, player\(\)\.y \);/, "else { advanceGravity(); didPlayerMoveThisFrame = true; } var ext = getExit( player().room, player().x, player().y ); ");

// END OF DANGER!

/* HELPERS
*/

function mapDir(dir) {
  return gravityMap[gravityDir][dir];
}

function invertPhysics(newDown) {
  if (isValidDir(newDown)) {
    gravityDir = newDown;
  } else {
    console.warn('gravity: invertGravity failed, expected "up|down|left|right", but got ', newDown);
  }
}

function isValidDir(dir) {
  return dirs.indexOf(dir) !== -1;
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function isSolid(dir, x, y) {
  var capDir = capitalize(dir);
  var wallCheck = `isWall${capDir}`;
  var spriteCheck = `getSprite${capDir}`;
  var isSpriteThere =  bitsy[spriteCheck]()
  var edgeMap = {
    up: { coord: y, value: 0 },
    down: { coord: y, value: 15 },
    left: { coord: x, value: 0 },
    right: { coord: x, value: 15 }
  }
  var edgeToCheck = edgeMap[dir]
  var isWallThere = bitsy[wallCheck]() || (edgeToCheck.coord == edgeToCheck.value)

  return isWallThere || isSpriteThere;
}

function isTileClimbable(x, y) {
  var tile = bitsy.tile[bitsy.getTile(x, y)];
  return tile && tile.name && hackOptions.isClimbable(tile)
}

function isOnStandableTile(player) {
  if (fallCounter > 1) return;
  var coords = [player.x, player.y]
  var offset = offsets[gravityDir]; // like [0, -1] for y -= 1
  coords[0] += offset[0]
  coords[1] += offset[1]
  var tile = bitsy.tile[bitsy.getTile(coords[0], coords[1])];
  return tile && tile.name && hackOptions.isStandable(tile)
}

function canMoveHorizontallyWhileFalling() {
  var withinMaxRatio = (horizontalFallingMoves / fallCounter) <= hackOptions.maxHorizontalFallingRatio;

  // if fallCounter is 0 (start of fall/jump) or player last moved down and is within ratio
  return !fallCounter || (lastMoveMapped === 'down' && withinMaxRatio);
}

function reallyMovePlayer(player, dir) {

  if (isSolid(dir, player.x, player.y)) {
    // can't move into solid thing...so...chill?
    // should maybe trigger sprites here?
    return;
  }

  // why doesn't isSolid catch the out of bounds? stuff? isWall should as well? weird...
  switch (dir) {
    case 'up':
      if (player.y > 0) player.y -= 1;
      break;
    case 'down':
      if (player.y < 15) player.y += 1;
      break;
    case 'left':
      if (player.x > 0) player.x -= 1;
      break;
    case 'right':
      if (player.x < 15) player.x += 1;
      break;
    default:
      console.warn('invalid move', player.x, player.y, dir)
  }
}

/* copied from ... stack overflow...or something... */

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

/* copied from directional-avatar and edited to add rotation */

// helper function to flip sprite data
function flip(spriteData, v, h, rot) {
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
    s = transpose(s)
  }

  return s;
}

function flipAvatar(gravityDirection) {
  var hflip = false;
  var vflip = false;
  var rot = false;

  var i;
  // save the original frames
  if (!originalAnimation || originalAnimation.referenceFrame !== getSpriteData(bitsy.playerId, 0)) {
    originalAnimation = {
      frames: []
    };
    for (i = 0; i < bitsy.player().animation.frameCount; ++i) {
      originalAnimation.frames.push(getSpriteData(bitsy.playerId, i));
    }
  }

  // determine which directions need flipping
  switch (gravityDirection) {
  case 'up':
    vflip = true;
    break;
  case 'down':
    vflip = false;
    break;
  case 'left':
    vflip = true;
    rot = true;
    break;
  case 'right':
    rot = true;
    break;
  default:
    break;
  }

  // update sprite with flipped frames
  for (i = 0; i < originalAnimation.frames.length; ++i) {
    setSpriteData(bitsy.playerId, i, flip(originalAnimation.frames[i], vflip, hflip, rot));
  }
  originalAnimation.referenceFrame = getSpriteData(bitsy.playerId, 0);
}

/* end of directional-avatar copy pasta */

/* dialog tags
*/


addDualDialogTag("invertGravity", function (env, params) {
  var newGravityDir = params[0];
  invertPhysics(newGravityDir);
  if (hackOptions.flipAvatarOnInversion) flipAvatar(newGravityDir);
})

addDualDialogTag('toggleGravity', function (env, params) {
  active = !active;
});

addDualDialogTag('setJumpPower', function (env, params) {
  var amt = ~~params[0];
  hackOptions.jumpPower = amt; // sets base jumpPower that gets re-plenished upon landing
  jumpPower = amt; // re-fills players current jumpPowers so they can get jumps mid-air
});

addDualDialogTag('toggleJetpack', function (env, params) {
  jetpack = !jetpack;
});

addDualDialogTag('forceGravity', function (env, params) {
  forceGravityDir = params[0];
});

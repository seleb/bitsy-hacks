/*
  ====================================
  DIALOG EXIT FUNCTION MOD (@mildmojo)
  ====================================

  Lets you exit to another room from dialog (including inside conditionals). Use
  it to make an invisible sprite that acts as a conditional exit, use it to warp
  somewhere after a conversation, use it to put a guard at your gate who only
  lets you in once you're disguised, use it to require payment before the
  ferryman will take you across the river.

  Using the {exitAfter} function in any part of a series of dialog will make the
  game exit to the new room after the dialog is finished. Using {exitNow} will
  cut off the dialog text and immediately warp to the new room.

  Usage: {exitAfter "<room name>,<x>,<y>"}
         {exitAfter "<room name>,<x>,<y>,sprite"}
         {exitNow "<room name>,<x>,<y>"}
         {exitNow "<room name>,<x>,<y>,sprite"}

  Example: {exitAfter "FinalRoom,8,4"}
           {exitNow "FinalRoom,8,11,sprite"}

  WARNING: In exit coordinates, the TOP left tile is (0,0). In sprite coordinates,
           the BOTTOM left tile is (0,0). If you'd like to use sprite coordinates,
           add the word "sprite" as the fourth parameter to the exit function.

  Installation:
    1. Paste all this code into new script tags at the bottom of your exported
       game's HTML file, right after the last /script> tag.

  NOTE: DON'T EDIT DIALOG FOR SPRITES/ITEMS WITH {exit} CALLS IN THE DIALOG WINDOW.
        Always edit them in the dialog textbox of the sprite/item window.
        Editing a sprite or item's dialog in the dialog window will replace your
        `{exitAfter "room,5,6"}` with `{}` and you probably won't notice that your
        exits are busted.

        For full editor integration, you'd *probably* also need to paste this
        code at the end of the editor's `bitsy.js` file. Untested.

  Version: 2.0
  Bitsy Version: 4.5, 4.6
  License: WTFPL (do WTF you want) except the `_inject` function by @seleb
*/

// Give a hoot, don't pollute; encapsulate in an IIFE for isolation.
(function(globals) {
  'use strict';

  var queuedDialogExit = null;

  // Hook into the game reset and make sure exit data gets cleared.
  var _clearGameData = clearGameData;
  globals.clearGameData = function() {
    _clearGameData.apply(this, arguments);
    queuedDialogExit = null;
  };

  // Hook into the dialog finish event; if there was an {exit}, travel there now.
  var _onExitDialog = onExitDialog;
  globals.onExitDialog = function() {
    _onExitDialog.apply(this, arguments);
    if (queuedDialogExit) {
      doPlayerExit(queuedDialogExit);
      queuedDialogExit = null;
    }
  };

  // Implement the {exitAfter} dialog function. It saves the room name and
  // destination X/Y coordinates so we can travel there after the dialog is over.
  globals.exitAfterFunc = function(environment, parameters, onReturn) {
    queuedDialogExit = _getExitParams(parameters);

    onReturn(null);
  }

  // Implement the {exitNow} dialog function. It exits to the destination room
  // and X/Y coordinates right damn now.
  globals.exitNowFunc = function(environment, parameters, onReturn) {
    var exitParams = _getExitParams(parameters);
    if (!exitParams) return;

    doPlayerExit(exitParams);
  }

  // Rewrite the Bitsy script tag, making these new functions callable from dialog.
  _inject(
    'var functionMap = new Map();',
    'functionMap.set("exitAfter", exitAfterFunc);',
    'functionMap.set("exitNow", exitNowFunc);'
  );

  function _getExitParams(parameters) {
    var params = parameters[0].split(',');
    var roomName = params[0];
    var x = params[1];
    var y = params[2];
    var coordsType = (params[3] || 'exit').toLowerCase();
    var useSpriteCoords = coordsType === 'sprite';
    var roomId = names.room.get(roomName);

    if (!roomName || x === undefined || y === undefined) {
      console.warn('{exit} was missing parameters! Usage: {exit "roomname,x,y"}');
      return null;
    }

    if (roomId === undefined) {
      console.warn("Bad {exit} parameter: Room '" + roomName + "' not found!");
      return null;
    }

    return {
      room: roomId,
      x: Number(x),
      y: useSpriteCoords ? 15 - Number(y) : Number(y)
    };
  }

  // dest === {room: Room, x: Int, y: Int}
  function doPlayerExit(dest) {
    player().room = dest.room;
    player().x = dest.x;
    player().y = dest.y;
    curRoom = dest.room;
  }

  // From https://gist.github.com/seleb/27798c1022e14aba82b9b77b97ad8002
  // helper used to inject code into script tags based on a search string
  function _inject(searchString, codeToInject) {
    // find the relevant script tag
    searchString = arguments[0];
    codeToInject = [].slice.call(arguments, 1).join('');

    var scriptTags = document.getElementsByTagName('script');
    var scriptTag;
    var code;
    for (var i = 0; i < scriptTags.length; ++i) {
      scriptTag = scriptTags[i];
      if (
        scriptTag.textContent.indexOf(searchString) >= 0 // script contains the search string
        &&
        scriptTag != document.currentScript // script isn't the one doing the injecting (which also contains the search string)
      ) {
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
    scriptTag.remove();
    scriptTag = document.createElement('script');
    scriptTag.textContent = code;
    document.head.appendChild(scriptTag);

    // recreate the script and dialog objects so that they'll be
    // referencing the code with injections instead of the original
    scriptModule = new Script();
    scriptInterpreter = scriptModule.CreateInterpreter();

    dialogModule = new Dialog();
    dialogRenderer = dialogModule.CreateRenderer();
    dialogBuffer = dialogModule.CreateBuffer();
  };

})(window);

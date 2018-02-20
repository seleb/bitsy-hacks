/*
  ======================================
  DIALOG ENDING FUNCTION MOD (@mildmojo)
  ======================================

  Lets you end the game from dialog (including inside conditionals).

  Using the {end} function in any part of a series of dialog will make the
  game end after the dialog is finished. Ending the game resets it back to the
  intro.

  Using {endNow} at the end of a sentence will display the whole sentence and
  immediately clear the background. No further dialog from that passage will
  display, and the game will reset when you proceed. Using {endNow} with
  narration text will immediately exit the dialog, clear the background, and
  show the ending narration in an ending-style centered dialog box.

  Usage: {end}
         {end "<ending narration>"}
         {endNow}
         {endNow "<ending narration>"}

  Example: {end}
           {end "Five friars bid you goodbye. You leave the temple, hopeful."}
           {endNow "The computer is still online! The chamber floods with neurotoxin."}

  HOW TO USE:
    1. Copy-paste this script into a new script tag after the Bitsy source code.

  NOTE: DON'T EDIT DIALOG FOR SPRITES/ITEMS WITH {end} CALLS IN THE DIALOG WINDOW.
        Always edit them in the dialog textbox of the sprite/item paint window.
        Editing any part of a sprite or item's dialog in the dialog window will
        cause the editor replace that sprite/item's `{end}` with `{}` and you
        probably won't notice that your endings are busted.

        For full editor integration, you'd *probably* also need to paste this
        code at the end of the editor's `bitsy.js` file. Untested.

  Version: 1.0
  Bitsy Version: 4.5, 4.6
  License: WTFPL (do WTF you want) except the `_inject` function by @seleb
*/

// Give a hoot, don't pollute; encapsulate in an IIFE for isolation.
(function(globals) {
  'use strict';

  var queuedEndingNarration = null;

  // Hook into the game reset and make sure queued ending data gets cleared.
  var _clearGameData = clearGameData;
  globals.clearGameData = function() {
    _clearGameData.apply(this, arguments);
    queuedEndingNarration = null;
  };

  // Hook into the dialog finish event; if there was an {end}, start the ending.
  var _onExitDialog = onExitDialog;
  globals.onExitDialog = function() {
    _onExitDialog.apply(this, arguments);
    if (!isEnding && queuedEndingNarration) {
      startNarrating(queuedEndingNarration === true ? null : queuedEndingNarration, true);
    }
  };

  // Implement the {end} dialog function. It stores the ending narration, if any,
  // and schedules the game to end after the current dialog finishes.
  globals.endFunc = function(environment, parameters, onReturn) {
    queuedEndingNarration = parameters || true;

    onReturn(null);
  }

  // Implement the {endNow} dialog function. It starts ending narration, if any,
  // and restarts the game right damn now.
  globals.endNowFunc = function(environment, parameters, onReturn) {
    endFunc.call(this, environment, parameters, function(){});
    dialogBuffer.EndDialog();
    onExitDialog();
  }

  // Rewrite the Bitsy script tag, making these new functions callable from dialog.
  _inject(
    'var functionMap = new Map();',
    'functionMap.set("end", endFunc);',
    'functionMap.set("endNow", endNowFunc);'
  );

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

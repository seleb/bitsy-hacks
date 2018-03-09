/**
🔚
@file end-from-dialog
@summary trigger an ending from dialog, including narration text
@license WTFPL (do WTF you want) except the `_inject` function by @seleb
@version 1.1.0
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
Lets you end the game from dialog (including inside conditionals).

Using the (end) function in any part of a series of dialog will make the
game end after the dialog is finished. Ending the game resets it back to the
intro.

Using (endNow) at the end of a sentence will display the whole sentence and
immediately clear the background. No further dialog from that passage will
display, and the game will reset when you proceed. Using (endNow) with
narration text will immediately exit the dialog, clear the background, and
show the ending narration in an ending-style centered dialog box.

Usage: (end)
       (end "<ending narration>")
       (endNow)
       (endNow "<ending narration>")

Example: (end)
         (end "Five friars bid you goodbye. You leave the temple, hopeful.")
         (endNow "The computer is still online! The chamber floods with neurotoxin.")

HOW TO USE:
  1. Copy-paste this script into a new script tag after the Bitsy source code.
     It should appear *before* any other mods that handle loading your game
     data so it executes *after* them (last-in first-out).

NOTE: This uses parentheses "()" instead of curly braces "{}" around function
      calls because the Bitsy editor's fancy dialog window strips unrecognized
      curly-brace functions from dialog text. To keep from losing data, write
      these function calls with parentheses like the examples above.

      For full editor integration, you'd *probably* also need to paste this
      code at the end of the editor's `bitsy.js` file. Untested.
*/
(function () {
'use strict';



// Give a hoot, don't pollute; encapsulate in an IIFE for isolation.
(function(globals) {

  var queuedEndingNarration = null;

  // Hook into game load and rewrite custom functions in game data to Bitsy format.
  var _load_game = load_game;
  globals.load_game = function(game_data, startWithTitle) {
     // Rewrite custom functions' parentheses to curly braces for Bitsy's
     // interpreter. Unescape escaped parentheticals, too.
    var fixedGameData = game_data
      .replace(/(^|[^\\])\(((end|endNow)( ".+?")?)\)/g, "$1{$2}") // Rewrite (end...) to {end...}
      .replace(/(^|\\)\(((end|endNow)( ".+?")?)\\?\)/g, "($2)");   // Rewrite \(end...\) to (end...)
    _load_game.call(this, fixedGameData, startWithTitle);
  };

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
  };

  // Implement the {endNow} dialog function. It starts ending narration, if any,
  // and restarts the game right damn now.
  globals.endNowFunc = function(environment, parameters, onReturn) {
    endFunc.call(this, environment, parameters, function(){});
    dialogBuffer.EndDialog();
    onExitDialog();
  };

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
  }
})(window);
// End of (end) dialog function mod

}());

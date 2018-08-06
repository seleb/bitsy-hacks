/**
📃
@file paragraph-break
@summary Adds paragraph breaks to the dialogue parser
@license WTFPL (do WTF you want)
@version 1.0.0
@requires Bitsy Version: 5.0, 5.1
@author Sean S. LeBlanc, David Mowatt

@description
Adds a (p) tag to the dialogue parser that forces the following text to 
start on a fresh dialogue screen, eliminating the need to spend hours testing
line lengths or adding multiple line breaks that then have to be reviewed
when you make edits or change the font size.

Usage: (p)
       
Example: I am a cat(p)and my dialogue contains multitudes

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
'use strict';

import {
	addDialogTag,
} from "./helpers/kitsy-script-toolkit";


//The actual function. Makes use of the existing AddLinebreak function within
//the dialogue parser to automatically add an appropriate number of line breaks
//based on the current dialogue buffer size rather than the user having to count

function paragraphbreakFunc(environment, parameters, onReturn) {
    var a = environment.GetDialogBuffer().CurRowCount();
    for (var i = 0; i < 3 - a; ++i) {
        environment.GetDialogBuffer().AddLinebreak();
    }
    onReturn(null);
}

//Adds the actual dialogue tag. No deferred version is required.
addDialogTag('p', paragraphbreakFunc);
// End of (p) paragraph break mod
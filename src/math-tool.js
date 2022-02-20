/**
🔢
@file math-tool
@summary Apply math operation to variable
@license MIT
@author hundun

@description
Apply math operation to variable immediately. Example make the number value of the variable to integer by ceil (implement by js Math.ceil).

Usage: 
    (ceil "variableId")
    (floor "variableId")

Example: {a = 42.5}(floor "a")Now "a" should be 42.

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

import { addDialogTag } from './helpers/kitsy-script-toolkit';

addDialogTag('ceil', function (environment, parameters, onReturn) {
    let varName = parameters[0];
    if (environment.HasVariable(varName)) {
        let newValue = Math.ceil(environment.GetVariable(varName));
        environment.SetVariable(varName, newValue);
    }
    onReturn(null);
});

addDialogTag('floor', function (environment, parameters, onReturn) {
    let varName = parameters[0];
    if (environment.HasVariable(varName)) {
        let newValue = Math.floor(environment.GetVariable(varName));
        environment.SetVariable(varName, newValue);
    }
    onReturn(null);
});
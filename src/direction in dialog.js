/**
🔝
@file direction in dialog
@summary provides a variable with player direction
@license MIT
@version 1.0.0
@requires 5.3
@author Sean S. LeBlanc

@description
Provides a variable "playerDirection" that can be accessed in dialog
The value will be one of:
	- "up"
	- "down"
	- "left"
	- "right"
Depending on the last input from the player.

Note that the variable will describe the direction the player moved,
so if they're interacting with a sprite, the opposite will be the direction from which they came
i.e. if the player moves into a sprite from the left, the variable will be "right"

HOW TO USE:
Copy-paste into a script tag after the bitsy source
*/
import bitsy from "bitsy";
import {
	before,
} from "./helpers/kitsy-script-toolkit";

var keys = {};
keys[bitsy.Direction.Up] = "up";
keys[bitsy.Direction.Down] = "down";
keys[bitsy.Direction.Left] = "left";
keys[bitsy.Direction.Right] = "right";
keys[bitsy.Direction.None] = null;

before('startDialog', function () {
	var direction = keys[bitsy.curPlayerDirection];
	if (direction) {
		bitsy.scriptInterpreter.SetVariable('playerDirection', direction);
	}
});

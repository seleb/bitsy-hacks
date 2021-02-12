/**
🎮
@file gamepad input
@summary HTML5 gamepad support
@license MIT
@version auto
@requires Bitsy Version: 5.1
@author Sean S. LeBlanc

@description
Adds support for gamepad input.

Directional input is mapped to the left and right analog sticks, the dpad, and the face buttons (e.g. ABXY).
The same hold-to-move logic used for keyboard input is shared with the gamepad input.

HOW TO USE:
Copy-paste this script into a script tag after the bitsy source
*/
import bitsy from 'bitsy';
import { Gamepads, Buttons, Axes } from 'input-gamepads.js';
import {
	before,
	after,
} from './helpers/kitsy-script-toolkit';

var gamepads = new Gamepads();
var empty = function () {};

var move = function (dpad, face, axis, axis2, axispast, axisdir, key) {
	// keydown
	if (
		gamepads.isJustDown(dpad)
		|| gamepads.isJustDown(face)
		|| gamepads.axisJustPast(axis, axispast, axisdir)
		|| gamepads.axisJustPast(axis2, axispast, axisdir)
		|| (
			bitsy.playerHoldToMoveTimer <= 0 && (
				gamepads.isDown(dpad)
				|| gamepads.isDown(face)
				|| gamepads.axisPast(axis, axispast, axisdir)
			)
		)
	) {
		bitsy.curPlayerDirection = bitsy.Direction.None;
		bitsy.input.onkeydown({
			keyCode: key,
			preventDefault: empty,
		});
	}

	// keyup
	if (
		gamepads.isJustUp(dpad)
		|| gamepads.isJustUp(face)
		|| gamepads.axisJustPast(axis, axispast, -axisdir)
		|| gamepads.axisJustPast(axis2, axispast, -axisdir)
	) {
		bitsy.input.onkeyup({
			keyCode: key,
			preventDefault: empty,
		});
	}
};

before('update', function () {
	move(Buttons.DPAD_LEFT, Buttons.X, Axes.LSTICK_H, Axes.RSTICK_H, -0.5, -1, bitsy.key.left);
	move(Buttons.DPAD_RIGHT, Buttons.B, Axes.LSTICK_H, Axes.RSTICK_H, 0.5, 1, bitsy.key.right);
	move(Buttons.DPAD_UP, Buttons.Y, Axes.LSTICK_V, Axes.RSTICK_V, -0.5, -1, bitsy.key.up);
	move(Buttons.DPAD_DOWN, Buttons.A, Axes.LSTICK_V, Axes.RSTICK_V, 0.5, 1, bitsy.key.down);
});
after('update', function () {
	gamepads.update();
});

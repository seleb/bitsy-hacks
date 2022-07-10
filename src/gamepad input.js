/**
🎮
@file gamepad input
@summary HTML5 gamepad support
@license MIT
@author Sean S. LeBlanc

@description
Adds support for gamepad input.

Directional input is mapped to the left and right analog sticks, the dpad, and the face buttons (e.g. ABXY).
The same hold-to-move logic used for keyboard input is shared with the gamepad input.

HOW TO USE:
Copy-paste this script into a script tag after the bitsy source
*/
import bitsy from 'bitsy';
import { Axes, Buttons, Gamepads } from 'input-gamepads.js';
import { after, before } from './helpers/kitsy-script-toolkit';

var gamepads = new Gamepads();

var move = function (dpad, face, axis, axis2, axispast, axisdir, key) {
	// keydown
	if (
		gamepads.isJustDown(dpad) ||
		gamepads.isJustDown(face) ||
		gamepads.axisJustPast(axis, axispast, axisdir) ||
		gamepads.axisJustPast(axis2, axispast, axisdir) ||
		(bitsy.playerHoldToMoveTimer <= 0 && (gamepads.isDown(dpad) || gamepads.isDown(face) || gamepads.axisPast(axis, axispast, axisdir)))
	) {
		// eslint-disable-next-line no-underscore-dangle
		bitsy.bitsy._poke(bitsy.bitsy._buttonBlock, key, 1);
	}

	// keyup
	if (gamepads.isJustUp(dpad) || gamepads.isJustUp(face) || gamepads.axisJustPast(axis, axispast, -axisdir) || gamepads.axisJustPast(axis2, axispast, -axisdir)) {
		// eslint-disable-next-line no-underscore-dangle
		bitsy.bitsy._poke(bitsy.bitsy._buttonBlock, key, 0);
	}
};

before('updateInput', function () {
	move(Buttons.DPAD_LEFT, Buttons.X, Axes.LSTICK_H, Axes.RSTICK_H, -0.5, -1, bitsy.bitsy.BTN_LEFT);
	move(Buttons.DPAD_RIGHT, Buttons.B, Axes.LSTICK_H, Axes.RSTICK_H, 0.5, 1, bitsy.bitsy.BTN_RIGHT);
	move(Buttons.DPAD_UP, Buttons.Y, Axes.LSTICK_V, Axes.RSTICK_V, -0.5, -1, bitsy.bitsy.BTN_UP);
	move(Buttons.DPAD_DOWN, Buttons.A, Axes.LSTICK_V, Axes.RSTICK_V, 0.5, 1, bitsy.bitsy.BTN_DOWN);
	if (gamepads.isJustDown(Buttons.START) || gamepads.isJustDown(Buttons.BACK)) {
		// eslint-disable-next-line no-underscore-dangle
		bitsy.bitsy._poke(bitsy.bitsy._buttonBlock, bitsy.bitsy.BTN_MENU, 1);
	}
	if (gamepads.isJustUp(Buttons.START) || gamepads.isJustUp(Buttons.BACK)) {
		// eslint-disable-next-line no-underscore-dangle
		bitsy.bitsy._poke(bitsy.bitsy._buttonBlock, bitsy.bitsy.BTN_MENU, 0);
	}
});
after('bitsy._update', function () {
	gamepads.update();
});

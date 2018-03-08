/*
bitsy hack - gamepad input

Adds support for gamepad input.

Directional input is mapped to the left and right analog sticks, the dpad, and the face buttons (e.g. ABXY).
The same hold-to-move logic used for keyboard input is shared with the gamepad input.

HOW TO USE:
Copy-paste this script into a script tag after the bitsy source
*/
import bitsy from "bitsy";
import gamepads from "input-gamepads.js";

var _startExportedGame = bitsy.startExportedGame;
bitsy.startExportedGame = function () {
	gamepads.init();
	if (_startExportedGame) {
		_startExportedGame();
	}
}
var empty = function () {};

var move = function (dpad, face, axis, axis2, axispast, axisdir, key) {
	// keydown
	if (
		gamepads.isJustDown(dpad) ||
		gamepads.isJustDown(face) ||
		gamepads.axisJustPast(axis, axispast, axisdir) ||
		(
			bitsy.playerHoldToMoveTimer <= 0 && (
				gamepads.isDown(dpad) ||
				gamepads.isDown(face) ||
				gamepads.axisPast(axis, axispast, axisdir)
			)
		)
	) {
		bitsy.curPlayerDirection = bitsy.Direction.None;
		bitsy.onkeydown({
			keyCode: key,
			preventDefault: empty
		});
	}

	// keyup
	if (
		gamepads.isJustUp(dpad) ||
		gamepads.isJustUp(face) ||
		gamepads.axisJustPast(axis, axispast, -axisdir)
	) {
		bitsy.onkeyup({
			keyCode: key,
			preventDefault: empty
		});
	}
}

var _update = bitsy.update;
bitsy.update = function () {
	move(gamepads.DPAD_LEFT, gamepads.X, gamepads.LSTICK_H, gamepads.RSTICK_H, -0.5, -1, bitsy.key.left);
	move(gamepads.DPAD_RIGHT, gamepads.B, gamepads.LSTICK_H, gamepads.RSTICK_H, 0.5, 1, bitsy.key.right);
	move(gamepads.DPAD_UP, gamepads.Y, gamepads.LSTICK_V, gamepads.RSTICK_V, -0.5, -1, bitsy.key.up);
	move(gamepads.DPAD_DOWN, gamepads.A, gamepads.LSTICK_V, gamepads.RSTICK_V, 0.5, 1, bitsy.key.down);

	if (_update) {
		_update();
	}
	gamepads.update();
}
/*
bitsy hack - gamepad input

Adds support for gamepad input.

This isn't a self-contained hack; it relies on https://github.com/seleb/inputs-gamepad.js
to handle the gamepad code, and this is simply the code needed to integrate for bitsy.
It's probably a bit overkill, but easier to use one known to work than write a custom one for bitsy right now.

Directional input is mapped to the left and right analog sticks, the dpad, and the face buttons (e.g. ABXY).
The same hold-to-move logic used for keyboard input is shared with the gamepad input.

HOW TO USE:
1. Copy https://github.com/seleb/inputs-gamepad.js/blob/master/input-gamepads.js into your game. You can either:
	- copy the contents into a script tag in the head
	- copy the file next to your html file and add a script tag with `src="input-gamepads.js"` to the head
2. Copy-paste this script into a script tag after the bitsy source
*/
(function () {
'use strict';


var _startExportedGame = startExportedGame;
startExportedGame = function () {
	gamepads.init();
	if (_startExportedGame) {
		_startExportedGame();
	}
};
var _update = update;
var empty = function () {};

var move = function (dpad, face, axis, axis2, axispast, axisdir, key) {
	// keydown
	if (
		gamepads.isJustDown(dpad) ||
		gamepads.isJustDown(face) ||
		gamepads.axisJustPast(axis, axispast, axisdir) ||
		(
			playerHoldToMoveTimer <= 0 && (
				gamepads.isDown(dpad) ||
				gamepads.isDown(face) ||
				gamepads.axisPast(axis, axispast, axisdir)
			)
		)
	) {
		curPlayerDirection = Direction.None;
		onkeydown({
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
		onkeyup({
			keyCode: key,
			preventDefault: empty
		});
	}
};
update = function () {
	move(gamepads.DPAD_LEFT, gamepads.X, gamepads.LSTICK_H, gamepads.RSTICK_H, -0.5, -1, key.left);
	move(gamepads.DPAD_RIGHT, gamepads.B, gamepads.LSTICK_H, gamepads.RSTICK_H, 0.5, 1, key.right);
	move(gamepads.DPAD_UP, gamepads.Y, gamepads.LSTICK_V, gamepads.RSTICK_V, -0.5, -1, key.up);
	move(gamepads.DPAD_DOWN, gamepads.A, gamepads.LSTICK_V, gamepads.RSTICK_V, 0.5, 1, key.down);

	if (_update) {
		_update();
	}
	gamepads.update();
};

}());

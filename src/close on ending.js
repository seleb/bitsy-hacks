/**
⛔️
@file close on ending
@summary Prevents from playing past an ending
@license MIT
@version 1.1.3
@author Sean S. LeBlanc

@description
Prevent from playing past an ending.
When an ending is reached, it will prevent the game from being restarted,
the bitsy game canvas will be removed, and it will attempt to close the window.
Windows can't always be closed due to browser security reasons;
rendering the game unresponsive is the best that can be done in that situation.

NOTE: This hack also disables the ctrl+r restart prompt,
but players will still be able to manually refresh or close/re-open the page to restart.

HOW TO USE:
Copy-paste this script into a script tag after the bitsy source
*/
import bitsy from 'bitsy';
import {
	inject,
	after
} from './helpers/kitsy-script-toolkit';

// prevent ctrl+r restart prompt
inject(/(function tryRestartGame\(e\) {)/, '$1return;');

after('onExitDialog', function () {
	if(bitsy.isEnding) {
		// prevent further input
		var no = function () {
			return false;
		};
		bitsy.input.isKeyDown = bitsy.input.anyKeyPressed = bitsy.input.swipeLeft = bitsy.input.swipeRight = bitsy.input.swipeUp = bitsy.input.swipeDown = bitsy.input.isTapReleased = no;
		// remove canvas
		bitsy.canvas.remove();
		// attempt to close
		window.close();
	}
});

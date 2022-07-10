/**
⛔️
@file close on ending
@summary Prevents from playing past an ending
@license MIT
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
import { after, before } from './helpers/kitsy-script-toolkit';

var closed = false;

// prevent ctrl+r restart prompt
before('bitsy.button', function (button) {
	if (closed) return [-1];
	if (button === bitsy.bitsy.BTN_MENU) return [-1];
	return [button];
});

after('onExitDialog', function () {
	if (bitsy.isEnding) {
		// prevent further input
		closed = true;
		// remove canvas
		// eslint-disable-next-line no-underscore-dangle
		bitsy.bitsy._getCanvas().remove();
		// attempt to close
		window.close();
	}
});

/**
📎
@file noclip
@summary walk through wall tiles, sprites, items, exits, and endings
@license MIT
@version 2.0.2
@author Sean S. LeBlanc

@description
Adds a "noclip" command, which allows player to walk through wall tiles, sprites, items, exits, and endings.
Also adds a room cycle command for use with noclip.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Press 'space' to toggle noclip
3. Press 'r' while noclip is enabled to cycle rooms
*/
import bitsy from "bitsy";
import {
	after
} from "./helpers/kitsy-script-toolkit";

var noClip = false;

// save references to existing functions
var _getSpriteAt = bitsy.getSpriteAt;
var _isWallLeft = bitsy.isWallLeft;
var _isWallRight = bitsy.isWallRight;
var _isWallUp = bitsy.isWallUp;
var _isWallDown = bitsy.isWallDown;
var _getExit = bitsy.getExit;
var _getEnding = bitsy.getEnding;
var _getItemIndex = bitsy.getItemIndex;

var toggleNoClip = function () {
	noClip = !noClip;
	if (noClip) {
		// disable functions
		bitsy.getSpriteAt =
		bitsy.isWallLeft =
		bitsy.isWallRight =
		bitsy.isWallUp =
		bitsy.isWallDown =
		bitsy.getExit =
		bitsy.getEnding =
		function () {
			return null;
		};
		bitsy.getItemIndex = function () {
			return -1;
		};
		console.log("noclip enabled");
	} else {
		// re-enable functions
		bitsy.getSpriteAt = _getSpriteAt;
		bitsy.isWallLeft = _isWallLeft;
		bitsy.isWallRight = _isWallRight;
		bitsy.isWallUp = _isWallUp;
		bitsy.isWallDown = _isWallDown;
		bitsy.getExit = _getExit;
		bitsy.getEnding = _getEnding;
		bitsy.getItemIndex = _getItemIndex;
		console.log("noclip disabled");
	}
};

after('onready', function () {
	bitsy.isPlayerEmbeddedInEditor = true; // HACK: prevent keydown from consuming all key events

	// add key handler
	document.addEventListener('keypress', function (e) {
		if (e.keyCode == 114 && noClip) {
			// cycle to next room on 'r' if no-clipping
			e.preventDefault();
			var k = Object.keys(bitsy.room);
			bitsy.curRoom = bitsy.player().room = k[(k.indexOf(bitsy.player().room) + 1) % k.length];
		} else if (e.keyCode == bitsy.key.space) {
			// toggle noclip on 'space'
			e.preventDefault();
			toggleNoClip();
		}
	});
});

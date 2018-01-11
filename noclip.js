/*
bitsy hack - noclip

Adds a "noclip" command, which allows player to walk through wall tiles, sprites, exits, and endings.
Also adds a room cycle command for use with noclip.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Press 'space' to toggle noclip
3. Press 'r' while noclip is enabled to cycle rooms
*/
(function () {
	var noClip = false;

	// save references to existing functions
	var _getSpriteLeft = getSpriteLeft;
	var _getSpriteRight = getSpriteRight;
	var _getSpriteUp = getSpriteUp;
	var _getSpriteDown = getSpriteDown;
	var _isWallLeft = isWallLeft;
	var _isWallRight = isWallRight;
	var _isWallUp = isWallUp;
	var _isWallDown = isWallDown;
	var _getExit = getExit;
	var _getEnding = getEnding;

	var toggleNoClip = function () {
		noClip = !noClip;
		if (noClip) {
			// disable functions
			getSpriteLeft = getSpriteRight = getSpriteUp = getSpriteDown = isWallLeft = isWallRight = isWallUp = isWallDown = getExit = getEnding = function () {
				return null;
			};
			console.log("noclip enabled");
		} else {
			// re-enable functions
			getSpriteLeft = _getSpriteLeft;
			getSpriteRight = _getSpriteRight;
			getSpriteUp = _getSpriteUp;
			getSpriteDown = _getSpriteDown;
			isWallLeft = _isWallLeft;
			isWallRight = _isWallRight;
			isWallUp = _isWallUp;
			isWallDown = _isWallDown;
			getExit = _getExit;
			getEnding = _getEnding;
			console.log("noclip disabled");
		}
	};

	var _onready = onready;
	onready = function (startWithTitle) {
		_onready(startWithTitle);
		isPlayerEmbeddedInEditor = true; // HACK: prevent keydown from consuming all key events

		// add key handler
		document.addEventListener('keypress', function (e) {
			if (e.keyCode == 114 && noClip) {
				// cycle to next room on 'r' if no-clipping
				e.preventDefault();
				var r = player().room;
				var k = Object.keys(room);
				curRoom = player().room = k[(k.indexOf(player().room) + 1) % k.length];
			} else if (e.keyCode == key.space) {
				// toggle noclip on 'space'
				e.preventDefault();
				toggleNoClip();
			}
		});
	};
}());
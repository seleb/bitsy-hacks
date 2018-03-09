/**
🔈
@file basic sfx
@summary "walk" and "talk" sound effect support
@license MIT
@version 1.0.0
@author Sean S. LeBlanc

@description
Adds a basic sound effect API and hooks up "walk" and "talk" sound effects

The walk sound effect plays every time the player moves.
The talk sound effect plays every time the dialog box changes "pages" (e.g. when it opens, when the player presses a key to continue).

Includes an optional feature which makes sound effect volume reduce if it was played recently.

HOW TO USE:
1. Place your "walk" and "talk" sound files somewhere relative to your bitsy html file
2. Copy-paste `<audio id="walk" src="<relative path to your walk sound file>" preload="auto" volume="1.0"></audio>` into the <body> of your document
3. Copy-paste `<audio id="talk" src="<relative path to your talk sound file>" preload="auto" volume="1.0"></audio>` into the <body> of your document
4. Copy-paste this script into a script tag after the bitsy source

Additional sounds can be added by by including more <audio> tags with different ids and calling `sounds.<sound id>()` as needed.
*/
(function (bitsy) {
'use strict';
var hackOptions = {
	beNiceToEars: true // if `true`, reduces volume of recently played sound effects
};

bitsy = bitsy && bitsy.hasOwnProperty('default') ? bitsy['default'] : bitsy;





var sounds = {};
var _startExportedGame = bitsy.startExportedGame;
bitsy.startExportedGame = function () {
	var playSound = function (sound) {
		if (hackOptions.beNiceToEars) {
			// reduce volume if played recently
			sound.volume = Math.min(1.0, Math.max(0.25, Math.pow((bitsy.prevTime - sound.lastPlayed) * .002, .5)));
			sound.lastPlayed = bitsy.prevTime;
		}

		// play sound
		if (sound.paused) {
			sound.play();
		} else {
			sound.currentTime = 0;
		}
	};

	// get sound elements
	var s = document.getElementsByTagName("audio");
	for (var i in s) {
		if (s.hasOwnProperty(i)) {
			i = s[i];
			i.lastPlayed = -Infinity;
			i.volume = 1;
			sounds[i.id] = playSound.bind(undefined, i);
		}
	}

	// start game after sound setup
	// so that title text can use it too
	if (_startExportedGame) {
		_startExportedGame();
	}
};

// walk hook
var _onPlayerMoved = bitsy.onPlayerMoved;
bitsy.onPlayerMoved = function () {
	if (_onPlayerMoved) {
		_onPlayerMoved();
	}
	sounds.walk();
};

// talk hooks
var _startDialog = bitsy.startDialog;
bitsy.startDialog = function () {
	if (_startDialog) {
		_startDialog.apply(this, arguments);
	}
	sounds.talk();
};
var _FlipPage = bitsy.dialogBuffer.FlipPage;
bitsy.dialogBuffer.FlipPage = function () {
	if (_FlipPage) {
		_FlipPage.call(this);
	}
	sounds.talk();
};

}(window));

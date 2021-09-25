/**
🔈
@file basic sfx
@summary "walk" and "talk" sound effect support
@license MIT
@author Sean S. LeBlanc

@description
Adds a basic sound effect API and hooks up "walk" and "talk" sound effects

The walk sound effect plays every time the player moves.
The talk sound effect plays every time the dialog box changes "pages" (e.g. when it opens, when the player presses a key to continue).

Includes an optional feature which makes sound effect volume reduce if it was played recently.
If you only want one of the two sound effects to play, delete the other from `hackOptions`.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Place your "walk" and "talk" sound files somewhere relative to your bitsy html file
3. Update `hackOptions` below with your filepaths

If you'd like more control over triggering sounds from dialog, check out the bitsymuse hack!
*/
import bitsy from 'bitsy';
import { after, before } from './helpers/kitsy-script-toolkit';
import { clamp, createAudio } from './helpers/utils';

export var hackOptions = {
	beNiceToEars: true, // if `true`, reduces volume of recently played sound effects
	walk: { src: './example walk filepath.mp3' },
	talk: { src: './example talk filepath.mp3' },
};

var sounds = {};
before('startExportedGame', function () {
	function playSound(sound) {
		if (hackOptions.beNiceToEars) {
			// reduce volume if played recently
			sound.volume = clamp(((bitsy.prevTime - (sound.lastPlayed || -Infinity)) * 0.002) ** 0.5, 0.25, 1.0);
			sound.lastPlayed = bitsy.prevTime;
		}

		// play sound
		if (sound.paused) {
			sound.play();
		} else {
			sound.currentTime = 0;
		}
	}

	if (hackOptions.walk) sounds.walk = playSound.bind(undefined, createAudio('walk', hackOptions.walk));
	if (hackOptions.talk) sounds.talk = playSound.bind(undefined, createAudio('talk', hackOptions.talk));
});

// walk hook
var px;
var py;
var pr;
before('update', function () {
	var player = bitsy.player();
	px = player.x;
	py = player.y;
	pr = player.room;
});
after('update', function () {
	var player = bitsy.player();
	if ((px !== player.x || py !== player.y || pr !== player.room) && sounds.walk) {
		sounds.walk();
	}
});

// talk hooks
after('startDialog', function () {
	if (sounds.talk) sounds.talk();
});
after('dialogBuffer.FlipPage', function () {
	if (sounds.talk) sounds.talk();
});

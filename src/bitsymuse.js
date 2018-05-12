/**
😌
@file bitsymuse
@summary A variety of Bitsy sound and music handlers
@license MIT
@version 1.0.0
@requires 4.8, 4.9
@author David Mowatt

@description
A hack that a variety of audio controls, including music that changes as you move between rooms.
If the same song is played as you move between rooms, the audio file will continue playing.

HOW TO USE:
1. Place your audio files somewhere relative to your bitsy html file (in the zip if you're uploading to itch.io)
2. Copy-paste `<audio id="<sound ID>" src="<relative path to sound file>"></audio>` into the <head> of your document.
   You need to do it once for each sound file you are adding, and each needs a unique sound ID. Add "loop" after the src=""
   tag if it's music that's going to loop (so `<audio id ="<sound id> src="<path>" loop></audio>
3. Copy-paste this script into a script tag after the bitsy source.
4. Edit hackOptions below to set up the TRACK LIST for rooms you move through.

In addition to the track list, which will play audio based on the room number, you have access to the following
commands you can add to dialogue:

1. soundeffect ("<sound ID>") will play a sound without interrupting the music
2. music ("<sound ID>?) will change the music as soon as it is called in the dialogue
3. musicEnd ("<sound ID>") will change the music once the dialogue box closes

You can call both music and musicEnd in the same dialogue, to e.g. change the music while you speak to a character
and then restart the regular room music once you stop speaking to them. "S" can be used as a sound ID for music
and musicEnd to Silence the music.

Whenever music tracks are changed they automatically restart from the beginning if you go back to a previous track.

*/

'use strict';
import bitsy from "bitsy";
import {
	before,
	after,
	inject
} from "./kitsy-script-toolkit.js";

var hackOptions = {
	musicByRoom: {
		0: 'song ID',
		1: 'S', // This room is silent - it will stop music when you enter
		2: 'another song ID',
		'room ID': 'third song ID'
	}
	//You need to put an entry in this list for every ROOM NUMBER that is accessible by the player,
	//and then specify the song ID for each room. Expand this list to as many rooms as you need.
	//If the player moves between rooms with the same audio ID the music keeps playing seamlessly.
	//Undefined rooms will keep playing whatever music they were last playing
	//You may add a song ID of 'S' to make a room fall silent.
};

var currentMusic;

var roomMusicFlag = null;


function playSound(soundParam) {

	if (!soundParam) {
		return;
	}
	
	document.getElementById(soundParam).play();

}

function changeMusic(newMusic) {

	if (!newMusic) {
		return;
	}
	
	if (newMusic === currentMusic) {
		return;
	}

	if (newMusic === 'S') {
		if (currentMusic !== 'S' && currentMusic) {
			document.getElementById(currentMusic).pause();
			document.getElementById(currentMusic).currentTime = 0.0;
		}
		currentMusic = newMusic;
		return;
	}

	if (currentMusic === undefined) {
		document.getElementById(newMusic).play();
		currentMusic = newMusic;
	} else {
		if (currentMusic !== 'S'&& currentMusic) {
			document.getElementById(currentMusic).pause();
			document.getElementById(currentMusic).currentTime = 0.0;
		}
		document.getElementById(newMusic).play();
		currentMusic = newMusic;
	}

}

after('drawRoom', function () {
	if (roomMusicFlag !== bitsy.curRoom) {	
		changeMusic(hackOptions.musicByRoom[bitsy.curRoom]);
		roomMusicFlag = bitsy.curRoom;
	}
});

var queuedMusic = null;

// Hook into game load and rewrite custom functions in game data to Bitsy format.
before('load_game', function (game_data, startWithTitle) {
	// Rewrite custom functions' parentheses to curly braces for Bitsy's
	// interpreter. Unescape escaped parentheticals, too.
	var fixedGameData = game_data
	.replace(/(^|[^\\])\((music(End)? ".+?")\)/g, "$1{$2}") // Rewrite (music...) to {music...}
	.replace(/\\\((music(End)? ".+")\\?\)/g, "($1)") // Rewrite \(music...\) to (music...)
	.replace(/(^|[^\\])\((soundeffect ".+?")\)/g, "$1{$2}") // Rewrite (soundeffect) to {soundeffect}
	.replace(/\\\((soundeffect ".+")\\?\)/g, "($1)"); // Rewrite \(soundeffect...\) to (soundeffect...)

	return [fixedGameData, startWithTitle];
});

// Hook into the game reset and make sure music data gets cleared.
after('clearGameData', function () {
	queuedMusic = null;
});

// Hook into the dialog finish event; if there was a {musicEnd}, play it now.
after('onExitDialog', function () {
	if (queuedMusic) {
		changeMusic(queuedMusic);
		queuedMusic = null;
	}
});

// Implement the {music} dialog function. It changes the music track as soon as
// it is called.
bitsy.musicFunc = function (environment, parameters, onReturn) {
	var musicParams = _getMusicParams('music', parameters);
	if (!musicParams) {
		return;
	}

	changeMusic(musicParams);
	onReturn(null);
}

// Implement the {musicEnd} dialog function. It saves the new track name and 
// changes it once the dialog closes.
bitsy.musicEndFunc = function (environment, parameters, onReturn) {
	queuedMusic = _getMusicParams('musicEnd', parameters);

	onReturn(null);
}

bitsy.soundeffectFunc = function (environment, parameters, onReturn) {
	var soundParams = _getMusicParams('soundeffect', parameters);
	if (!soundParams) {
		return;
	}
	
	playSound(soundParams);
	onReturn(null);
}

// Rewrite the Bitsy script tag, making these new functions callable from dialog.
inject(
	'var functionMap = new Map();',
	'functionMap.set("music", musicFunc);',
	'functionMap.set("musicEnd", musicEndFunc);',
	'functionMap.set("soundeffect", soundeffectFunc);'
);

function _getMusicParams(musicFuncName, parameters) {
	var params = parameters[0].split(',');
	var trackName = params[0];

	if (!trackName) {
		console.warn('{' + musicFuncName + '} was missing parameters! Usage: {' +
			musicFuncName + ' "track name"}');
		return null;
	}

	return trackName;
}


// End of (music) dialog function mod
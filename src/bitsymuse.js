/**
😌
@file bitsymuse
@summary A variety of Bitsy sound and music handlers
@license MIT
@version 3.1.0
@requires 4.8, 4.9
@author David Mowatt

@description
A hack that adds a variety of audio controls, including music that changes as you move between rooms.
If the same song is played as you move between rooms, the audio file will continue playing.

HOW TO USE:
1. Place your audio files somewhere relative to your bitsy html file (in the zip if you're uploading to itch.io)
2. Copy-paste this script into a script tag after the bitsy source.
3. Edit hackOptions below to set up the track list for rooms you move through.

In addition to the track list, which will play audio based on the room id/name,
you have access to the following commands you can add to dialogue:

1. (soundeffectNow "<audio ID>") will play a sound without interrupting the music as soon as it is called in the dialogue
2. (soundeffect "<audio ID>") will play a sound without interrupting the music once the dialogue box closes
3. (musicNow "<audio ID>") will change the music as soon as it is called in the dialogue
4. (music "<audio ID>") will change the music once the dialogue box closes

You can call both musicNow and music in the same dialogue, to e.g. change the music while you speak to a character
and then restart the regular room music once you stop speaking to them.
You can also use a special ID ("S" by default) to Silence the music.

By default, music tracks automatically restart from the beginning if you go back to a previous track.
This can also be changed in the hackOptions below.
*/


import bitsy from 'bitsy';
import {
	getRoom,
} from './helpers/utils';
import {
	after,
	addDualDialogTag,
} from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	// Put entries in this list for each audio file you want to use
	// the key will be the id needed to play it in dialog tags and the musicByRoom options below,
	// and the value will be the properties of the corresponding <audio> tag (e.g. src, loop, volume)
	// Note: you can add <audio> tags to the html manually if you prefer
	audio: {
		// Note: the entries below are examples that should be removed and replaced with your own audio files
		'example song ID': { src: './example song filepath.mp3', loop: true },
		'example sfx ID': { src: './example sfx filepath.mp3', volume: 0.5 },
	},
	// Put entries in this list for every room ID or name that will change the music
	// If the player moves between rooms with the same audio ID, the music keeps playing seamlessly.
	// Undefined rooms will keep playing whatever music they were last playing
	musicByRoom: {
		// Note: the entries below are examples that should be removed and replaced with your own room -> audio id mappings
		0: 'example song ID',
		1: 'S', // This room is silent - it will stop music when you enter (see `silenceId` below)
		2: 'another song ID',
		h: 'a song ID for a room with a non-numeric ID',
		'my room': 'a song ID for a room with a user-defined name',
	},
	silenceId: 'S', // Use this song ID to make a room fall silent.
	resume: false, // If true, songs will pause/resume on change; otherwise, they'll stop/play (doesn't affect sound effects)
};

var audioElementsById = {};
var currentMusic;
var roomMusicFlag = null;

after('load_game', function () {
	var room;
	// expand the map to include ids of rooms listed by name
	Object.entries(hackOptions.musicByRoom).forEach(function (entry) {
		room = getRoom(entry[0]);
		if (room) {
			hackOptions.musicByRoom[room.id] = entry[1];
		}
	});
	// add audio tags from options
	Object.entries(hackOptions.audio).forEach(function (entry) {
		var el = document.createElement('audio');
		el.id = entry[0];
		Object.assign(el, entry[1]);
		document.body.appendChild(el);
		audioElementsById[el.id] = el;
	});
});

// handle autoplay restriction
var playedOnMoveOnce = true;
after('onPlayerMoved', function () {
	if (playedOnMoveOnce && currentMusic !== hackOptions.silenceId) {
		playedOnMoveOnce = false;
		getAudio(currentMusic).play();
	}
});


function getAudio(id) {
	var el = audioElementsById[id] || (audioElementsById[id] = document.getElementById(id));
	if (!el) {
		throw new Error("bitsymuse tried to use audio with id '" + id + "' but couldn't find one on the page!");
	}
	return el;
}

function playSound(soundParam) {
	if (!soundParam) {
		return;
	}
	getAudio(soundParam).play();
}

function changeMusic(newMusic) {
	var audio;
	// if we didn't get new music,
	// or the music didn't change,
	// there's no work to be done
	if (!newMusic || newMusic === currentMusic) {
		return;
	}

	// stop old music
	if (currentMusic && currentMusic !== hackOptions.silenceId) {
		audio = getAudio(currentMusic);
		audio.pause();
		if (!hackOptions.resume) {
			audio.currentTime = 0.0;
		}
	}

	// start new music
	currentMusic = newMusic;
	// special case: don't start anything new
	if (newMusic === hackOptions.silenceId) {
		return;
	}
	getAudio(newMusic).play();
}

after('drawRoom', function () {
	if (roomMusicFlag !== bitsy.curRoom) {
		changeMusic(hackOptions.musicByRoom[bitsy.curRoom]);
		roomMusicFlag = bitsy.curRoom;
	}
});

// Implement the dialog functions
addDualDialogTag('music', function (environment, parameters) {
	if (!parameters[0]) {
		throw new Error('{music/musicNow} was missing parameters! Usage: {music/musicNow "track name"}');
	}
	changeMusic(parameters[0]);
});

addDualDialogTag('soundeffect', function (environment, parameters) {
	if (!parameters[0]) {
		throw new Error('{soundeffect/soundeffectNow} was missing parameters! Usage: {soundeffect/soundeffectNow "track name"}');
	}
	playSound(parameters[0]);
});
// End of (music) dialog function mod

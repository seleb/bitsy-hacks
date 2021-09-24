/**
🗣
@file text-to-speech
@summary text-to-speech for bitsy dialog
@license MIT
@version auto
@requires 5.5
@author Sean S. LeBlanc

@description
Adds text-to-speech (TTS) to bitsy dialog.

Support is included for both an automatic mode in which all dialog is run through TTS,
and a manual mode in which TTS can be triggered via dialog commands.

Due to how bitsy handles scripting, the automatic mode is only able to read a segment of dialog *after* it has finished printing.
This means that normally you'd often be waiting a long time for text animation to complete before hearing the TTS.
Players could manually skip the dialog animations to speed this up, but I've found that this is still quite stilted.
The hackOption `hurried` is included below, which automatically skips text animation in order to help counteract this.

Usage:
	(ttsVoice "<pitch>,<rate>,<voice>")
	(ttsVoiceNow "<pitch>,<rate>,<voice>")
	(tts "<text queued to speak at end of dialog>")
	(ttsNow "<text queued to speak immediately>")

Example:
	(ttsVoiceNow "0.5,0.5,Google UK English Male")
	(ttsNow "This will be heard but not seen.")

Notes:
	- Because the TTS reads an entire page at once, voice parameters cannot be changed mid-line.
	  If you're using multiple voices, make sure to only set voices at the start and/or end of pages.
	- Unprovided voice parameters will default to the last value used
	  e.g. if you lower the pitch, read a line, increase the rate, read another line,
	  the second line will have both a lower pitch and a higher rate.
	- Voice support varies a lot by platform!
	  In general, you should only rely on a single voice (the locally provided synth) being available.
	  In chrome, a number of remote synths are provided, but these will only work while online.
	  You can use whatever voices are available, but be aware that they may fallback to default for players.
	- To see what voices are available in your browser, run `speechSynthesis.getVoices()` in the console

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/

import bitsy from 'bitsy';
import { addDualDialogTag, after, inject } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	automatic: true, // disable this to prevent TTS from playing for all dialog (i.e. you only want to use TTS via commands)
	hurried: true, // disable this to let bitsy text animations play out normally (not recommended for automatic mode)
};

var speaking = false;
var toSpeak = [];
var latestUtterance; // we need to maintain a reference to this, or a bug in the GC will prevent events from firing
var lastPitch = 1;
var lastRate = 1;
var lastVoice = '';

var voices = {};

var speechSynthesis = window.speechSynthesis;
if (!speechSynthesis) {
	console.error('TTS not available!');
} else {
	speechSynthesis.onvoiceschanged = function () {
		var v = speechSynthesis.getVoices();
		voices = v.reduce(function (result, voice) {
			result[voice.name] = voice;
			return result;
		}, {});
	};
}

function queueVoice(params) {
	params = params || [];
	var pitch = (lastPitch = params[0] || lastPitch);
	var rate = (lastRate = params[1] || lastRate);
	var voice = (lastVoice = params[2] || lastVoice);
	toSpeak.push({
		pitch: pitch,
		rate: rate,
		voice: voice,
		text: [],
	});
}

function queueSpeak(text) {
	if (!toSpeak.length) {
		queueVoice();
	}
	toSpeak[toSpeak.length - 1].text.push(text);
	if (!speaking) {
		speak();
	}
}

function speak() {
	if (!speechSynthesis) {
		return;
	}
	if (!toSpeak.length) {
		return;
	}
	var s = toSpeak.shift();
	speechSynthesis.cancel();
	var text = s.text.join(' ');
	if (!text) {
		speak();
		return;
	}
	console.log('TTS: ', text);
	latestUtterance = new SpeechSynthesisUtterance(text);
	latestUtterance.pitch = s.pitch;
	latestUtterance.rate = s.rate;
	latestUtterance.voice = voices[s.voice];
	latestUtterance.onend = function () {
		setTimeout(() => {
			speaking = false;
			if (toSpeak.length) {
				speak();
			}
		});
	};
	latestUtterance.onerror = function (error) {
		speaking = false;
		console.error(error);
	};
	speaking = true;
	speechSynthesis.speak(latestUtterance);
}

// queue a newline when dialog ends in case you start a new dialog before the TTS finishes
// this smooths out the TTS playback in cases without punctuation (which is common b/c bitsyfolk)
after('dialogBuffer.EndDialog', function () {
	queueVoice();
});

// save the character on dialog font characters so we can read it back post-render
inject(/(function DialogFontChar\(font, char, effectList\) {)/, '$1\nthis.char = char;');

// queue speaking based on whether we have finished rendering text
var spoke = false;
after('dialogRenderer.DrawNextArrow', function () {
	if (hackOptions.automatic && !spoke) {
		queueSpeak(
			bitsy.dialogBuffer
				.CurPage()
				.map(a => a.map(i => i.char).join(''))
				.join(' ')
		);
		spoke = true;
	}
});
after('dialogBuffer.Continue', function () {
	spoke = false;
});

// hook up hurried mode
function hurry() {
	setTimeout(() => {
		if (bitsy.dialogBuffer.CurPage()) {
			bitsy.dialogBuffer.Skip();
		}
	});
}
after('dialogBuffer.FlipPage', hurry);
after('startDialog', hurry);

// hook up dialog commands
addDualDialogTag('ttsVoice', function (environment, parameters) {
	queueVoice(parameters[0].split(','));
});
addDualDialogTag('tts', function (environment, parameters) {
	queueSpeak(parameters[0]);
});

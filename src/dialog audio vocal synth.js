/**
🎺
@file dialog audio vocal synth
@summary animal crossing-style audio powered by the pink trombone vocal synth
@license MIT
@author Sean S. LeBlanc

@description
An extension of the dialog audio hack which incorporates
a vocal synth with multiple voice support

Voices are defined in `hackOptions.voices` below
A default voice is required, but the volume can be set to zero if needed
Other voices don't need to have every property specified:
if one is missing, it will use the default voice's value instead

Usage:
	(voice "<voice name>")

Parameter notes:
	- Valid voice names are the keys in `hackOptions.voices`
	- If a voice name is used that does not exist, the default voice will be used instead

Examples:
	(voice "myVoice")
	(voice "default")
	(voice "") // same effect as default

Note: most of the credit for this goes to Neil Thapen,
the creator of the Pink Trombone vocal synth;
this uses a fork of its source code to drive the audio

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit `hackOptions` below as needed
3. Add (voice "<voice name>") commands to your dialog as needed
*/
import { Glottis, Tract } from '@seansleblanc/pink-trombone';
import { hackOptions as dialogAudioOptions } from './dialog audio';
import { addDialogTag, after, before } from './helpers/kitsy-script-toolkit';
import { clamp } from './helpers/utils';

export var hackOptions = {
	autoReset: true, // if true, automatically resets the voice to default when dialog is exited
	// list of voices that can be used with the provided dialog command
	// the values use for voice parameters are [base, range] pairs for RNG;
	// e.g. [0.5, 0.1] will produce values between 0.4 and 0.6
	voices: {
		default: {
			// volume randomly applied to each letter
			volume: [0.3, 0.1],
			// pitch randomly applied to each letter
			pitch: [240, 200],
			// vibrato randomly applied to each letter
			vibrato: [0.01, 0.005],
			// how much phonemes to affect tract shape
			phoneme: [0.9, 0.1],
			// multiplier for nasalness (based on phoneme)
			nasal: [0.9, 0.1],
			// multiplier for voiced (based on phoneme)
			voiced: [0.4, 0.2],
			// note: tongue is a modification *on top* of the phoneme modification
			// where to modify
			tonguePosition: [0.5, 0.5],
			// range from the position in which points are modified
			tongueSize: [0.3, 0.2],
			// how much modification is applied (this is a multiplier, so base: 1, range: 0 means no modification)
			tongueAmount: [1.0, 0.1],
		},
		// an example voice which overrides the default's pitch and vibrato
		overrideExample: {
			pitch: [650, 325],
			vibrato: [0.3, 0.1],
		},
	},
};

var defaultVoice = hackOptions.voices.default;
var voice;

// these are mostly guess-work based on playing around with the original pink trombone UI
// some are pretty good but definitely could use some refinement
var phonemes = {
	h: {
		voiced: 0.1,
		nasal: 0.1,
		tongue: {
			position: 0.5,
			size: 0.25,
			amount: 1,
		},
	},
	a: {
		voiced: 1,
		nasal: 0.1,
		tongue: {
			position: 0.5,
			size: 0.25,
			amount: 1,
		},
	},
	o: {
		voiced: 1,
		nasal: 0.1,
		tongue: {
			position: 0.25,
			size: 0.25,
			amount: 0.1,
		},
	},
	ee: {
		voiced: 1,
		nasal: 0.1,
		tongue: {
			position: 0.5,
			size: 0.25,
			amount: 0.1,
		},
	},
	u: {
		voiced: 1,
		nasal: 0.1,
		tongue: {
			position: 0.5,
			size: 0.25,
			amount: 0.5,
		},
	},
	l: {
		voiced: 1,
		nasal: 0.1,
		tongue: {
			position: 0.75,
			size: 0.1,
			amount: 0.25,
		},
	},
	s: {
		voiced: 0.1,
		nasal: 0,
		tongue: {
			position: 0.75,
			size: 0.1,
			amount: 0.1,
		},
	},
	z: {
		voiced: 1,
		nasal: 0,
		tongue: {
			position: 0.75,
			size: 0.1,
			amount: 0.1,
		},
	},
	m: {
		voiced: 1,
		nasal: 1,
		tongue: {
			position: 1.0,
			size: 0.3,
			amount: 0,
		},
	},
	v: {
		voiced: 1,
		nasal: 0.1,
		tongue: {
			position: 1.0,
			size: 0.1,
			amount: 0.05,
		},
	},
	f: {
		voiced: 0.1,
		nasal: 0.1,
		tongue: {
			position: 1.0,
			size: 0.1,
			amount: 0.05,
		},
	},
	n: {
		voiced: 1,
		nasal: 1,
		tongue: {
			position: 0.75,
			size: 0.3,
			amount: 0,
		},
	},
	p: {
		voiced: 0.1,
		nasal: 1,
		tongue: {
			position: 0.9,
			size: 0.2,
			amount: 0,
		},
	},
	b: {
		voiced: 1,
		nasal: 0.1,
		tongue: {
			position: 0.9,
			size: 0.2,
			amount: 0,
		},
	},
	w: {
		voiced: 1,
		nasal: 1,
		tongue: {
			position: 0.8,
			size: 0.1,
			amount: 0,
		},
	},
	g: {
		voiced: 1,
		nasal: 0.1,
		tongue: {
			position: 0.5,
			size: 0.3,
			amount: 0,
		},
	},
	k: {
		voiced: 1,
		nasal: 0.1,
		tongue: {
			position: 0.25,
			size: 0.2,
			amount: 0,
		},
	},
	t: {
		voiced: 0,
		nasal: 0.1,
		tongue: {
			position: 0.6,
			size: 0.3,
			amount: 0,
		},
	},
	d: {
		voiced: 1,
		nasal: 0.1,
		tongue: {
			position: 0.6,
			size: 0.3,
			amount: 0,
		},
	},
	yr: {
		voiced: 1,
		nasal: 0.1,
		tongue: {
			position: 0.7,
			size: 0.3,
			amount: 0.5,
		},
	},
};

function getPhoneme(letter) {
	switch (letter) {
		case 'e':
		case 'i':
			return 'ee';
		case 'r':
		case 'y':
			return 'yr';
		case 'c':
		case 'k':
		case 'q':
		case 'x':
			return 'k';
		default:
			return letter;
	}
}

export { Glottis, Tract };

function lerp(from, to, by) {
	return from + (to - from) * by;
}

// helper for random values
function getValue(randomOption) {
	var rnd = 1.0 - (Math.random() * 2 - 1) ** 2;
	return randomOption[0] + randomOption[1] * rnd;
}

function resetTract() {
	Tract.targetDiameter = Tract.restDiameter.slice();
}

dialogAudioOptions.onLetter = function (character) {
	var first = !Glottis.isTouched;
	resetTract();
	Glottis.isTouched = false;
	// skip pre-setup, nulls, and if dialog is skipping
	if (!character || !character.char || skipping) {
		return;
	}
	var char = character.char.toLowerCase().match(/[a-z0-9]/);
	// skip non-alphanumeric
	if (!char) {
		return;
	}
	char = char[0];
	var phoneme = phonemes[getPhoneme(char)];
	if (!phoneme) {
		return;
	}

	Glottis.isTouched = true;
	applyVoice();

	// apply phoneme
	Glottis.UITenseness = phoneme.voiced * getValue(voice.voiced || defaultVoice.voiced);
	var l = Tract.targetDiameter.length;
	var adjustPoint = phoneme.tongue.position;
	var adjustSize = phoneme.tongue.size;
	var adjustAmp = lerp(1, phoneme.tongue.amount, getValue(voice.phoneme || defaultVoice.phoneme));
	var adjustNasal = phoneme.nasal;
	Tract.velumTarget *= adjustNasal;
	Tract.targetDiameter = Tract.targetDiameter.map((v, i) => {
		var pointInTract = i / l;
		var distanceFromAdjust = Math.abs(adjustPoint - pointInTract);
		var adjustAmount = 1.0 - clamp(distanceFromAdjust / adjustSize, 0, 1);
		return lerp(v, v * adjustAmp, adjustAmount);
	});

	adjustPoint = getValue(voice.tonguePosition || defaultVoice.tonguePosition);
	adjustSize = getValue(voice.tongueSize || defaultVoice.tongueSize);
	adjustAmp = getValue(voice.tongueAmount || defaultVoice.tongueAmount);
	Tract.targetDiameter = Tract.targetDiameter.map((v, i) => {
		var pointInTract = i / l;
		var distanceFromAdjust = Math.abs(adjustPoint - pointInTract);
		var adjustAmount = 1.0 - clamp(distanceFromAdjust / adjustSize, 0, 1);
		return lerp(v, v * adjustAmp, adjustAmount);
	});

	if (first) {
		Tract.diameter = Tract.targetDiameter.slice();
	}
};

function applyVoice() {
	Glottis.loudness = getValue(voice.volume || defaultVoice.volume);
	Glottis.vibratoAmount = getValue(voice.vibrato || defaultVoice.vibrato);
	Glottis.UIFrequency = getValue(voice.pitch || defaultVoice.pitch);
	Tract.velumTarget = getValue(voice.nasal || defaultVoice.nasal);
}

var skipping = false;
before('dialogBuffer.Skip', () => {
	skipping = true;
});
after('dialogBuffer.Skip', () => {
	skipping = false;
});
// always stop speaking at end of dialog
after('dialogRenderer.DrawNextArrow', () => {
	Glottis.isTouched = false;
	resetTract();
});

after('onExitDialog', function () {
	if (hackOptions.autoReset) {
		voice = defaultVoice;
		resetTract();
		applyVoice();
	}
});

addDialogTag('voice', function (environment, parameters, onReturn) {
	voice = hackOptions.voices[parameters[0]] || defaultVoice;
	onReturn(null);
});

after('onready', function () {
	defaultVoice = hackOptions.voices.default;
	voice = defaultVoice;
});

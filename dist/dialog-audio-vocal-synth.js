/**
🎺
@file dialog audio vocal synth
@summary animal crossing-style audio powered by the pink trombone vocal synth
@license MIT
@version 1.1.3
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
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions$1 = {
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

bitsy = bitsy && Object.prototype.hasOwnProperty.call(bitsy, 'default') ? bitsy['default'] : bitsy;

/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */

var module = {};

function Grad(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

Grad.prototype.dot2 = function (x, y) {
	return this.x * x + this.y * y;
};

Grad.prototype.dot3 = function (x, y, z) {
	return this.x * x + this.y * y + this.z * z;
};

var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
	new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
	new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)
];

var p = [151, 160, 137, 91, 90, 15,
	131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
	190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
	88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
	77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
	102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
	135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
	5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
	223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
	129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
	251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
	49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
	138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
];
// To remove the need for index wrapping, double the permutation table length
var perm = new Array(512);
var gradP = new Array(512);

// This isn't a very good seeding function, but it works ok. It supports 2^16
// different seed values. Write something better if you need more seeds.
module.seed = function (seed) {
	if (seed > 0 && seed < 1) {
		// Scale the seed out
		seed *= 65536;
	}

	seed = Math.floor(seed);
	if (seed < 256) {
		seed |= seed << 8;
	}

	for (var i = 0; i < 256; i++) {
		var v;
		if (i & 1) {
			v = p[i] ^ (seed & 255);
		} else {
			v = p[i] ^ ((seed >> 8) & 255);
		}

		perm[i] = perm[i + 256] = v;
		gradP[i] = gradP[i + 256] = grad3[v % 12];
	}
};

module.seed(Date.now());

/*
for(var i=0; i<256; i++) {
  perm[i] = perm[i + 256] = p[i];
  gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
}*/

// Skewing and unskewing factors for 2, 3, and 4 dimensions
var F2 = 0.5 * (Math.sqrt(3) - 1);
var G2 = (3 - Math.sqrt(3)) / 6;

// 2D simplex noise
module.simplex2 = function (xin, yin) {
	var n0, n1, n2; // Noise contributions from the three corners
	// Skew the input space to determine which simplex cell we're in
	var s = (xin + yin) * F2; // Hairy factor for 2D
	var i = Math.floor(xin + s);
	var j = Math.floor(yin + s);
	var t = (i + j) * G2;
	var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
	var y0 = yin - j + t;
	// For the 2D case, the simplex shape is an equilateral triangle.
	// Determine which simplex we are in.
	var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
	if (x0 > y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
		i1 = 1;
		j1 = 0;
	} else { // upper triangle, YX order: (0,0)->(0,1)->(1,1)
		i1 = 0;
		j1 = 1;
	}
	// A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
	// a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
	// c = (3-sqrt(3))/6
	var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
	var y1 = y0 - j1 + G2;
	var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
	var y2 = y0 - 1 + 2 * G2;
	// Work out the hashed gradient indices of the three simplex corners
	i &= 255;
	j &= 255;
	var gi0 = gradP[i + perm[j]];
	var gi1 = gradP[i + i1 + perm[j + j1]];
	var gi2 = gradP[i + 1 + perm[j + 1]];
	// Calculate the contribution from the three corners
	var t0 = 0.5 - x0 * x0 - y0 * y0;
	if (t0 < 0) {
		n0 = 0;
	} else {
		t0 *= t0;
		n0 = t0 * t0 * gi0.dot2(x0, y0); // (x,y) of grad3 used for 2D gradient
	}
	var t1 = 0.5 - x1 * x1 - y1 * y1;
	if (t1 < 0) {
		n1 = 0;
	} else {
		t1 *= t1;
		n1 = t1 * t1 * gi1.dot2(x1, y1);
	}
	var t2 = 0.5 - x2 * x2 - y2 * y2;
	if (t2 < 0) {
		n2 = 0;
	} else {
		t2 *= t2;
		n2 = t2 * t2 * gi2.dot2(x2, y2);
	}
	// Add contributions from each corner to get the final noise value.
	// The result is scaled to return values in the interval [-1,1].
	return 70 * (n0 + n1 + n2);
};

module.simplex1 = function (x) {
	return module.simplex2(x * 1.2, -x * 0.7);
};

/**
P I N K   T R O M B O N E

Bare-handed procedural speech synthesis

version 1.1, March 2017
by Neil Thapen
venuspatrol.nfshost.com


Bibliography

Julius O. Smith III, "Physical audio signal processing for virtual musical instruments and audio effects."
https://ccrma.stanford.edu/~jos/pasp/

Story, Brad H. "A parametric model of the vocal tract area function for vowel and consonant simulation." 
The Journal of the Acoustical Society of America 117.5 (2005): 3231-3254.

Lu, Hui-Ling, and J. O. Smith. "Glottal source modeling for singing voice synthesis." 
Proceedings of the 2000 International Computer Music Conference. 2000.

Mullen, Jack. Physical modelling of the vocal tract with the 2D digital waveguide mesh. 
PhD thesis, University of York, 2006.


Copyright 2017 Neil Thapen 

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
IN THE SOFTWARE.
*/

function clamp(number, min, max) {
	if (number < min) return min;
	else if (number > max) return max;
	else return number;
}

function moveTowards(current, target, amountUp, amountDown) {
	if (current < target) return Math.min(current + amountUp, target);
	else return Math.max(current - amountDown, target);
}

var sampleRate;
var alwaysVoice = false;

var AudioSystem = {
	blockLength: 512,
	blockTime: 1,
	started: false,
	soundOn: false,

	init: function () {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this.audioContext = new window.AudioContext();
		sampleRate = this.audioContext.sampleRate;

		this.blockTime = this.blockLength / sampleRate;

		var unmute = () => {
			if (!this.started) {
				this.started = true;
				this.startSound();
				document.removeEventListener('pointerup', unmute);
				document.removeEventListener('keydown', unmute);
			}
		};

		document.addEventListener('pointerup', unmute);
		document.addEventListener('keydown', unmute);
	},

	startSound: function () {
		//scriptProcessor may need a dummy input channel on iOS
		this.scriptProcessor = this.audioContext.createScriptProcessor(this.blockLength, 2, 1);
		this.scriptProcessor.connect(this.audioContext.destination);
		this.scriptProcessor.onaudioprocess = AudioSystem.doScriptProcessor;

		var whiteNoise = this.createWhiteNoiseNode(2 * sampleRate); // 2 seconds of noise

		var aspirateFilter = this.audioContext.createBiquadFilter();
		aspirateFilter.type = "bandpass";
		aspirateFilter.frequency.value = 500;
		aspirateFilter.Q.value = 0.5;
		whiteNoise.connect(aspirateFilter);
		aspirateFilter.connect(this.scriptProcessor);

		var fricativeFilter = this.audioContext.createBiquadFilter();
		fricativeFilter.type = "bandpass";
		fricativeFilter.frequency.value = 1000;
		fricativeFilter.Q.value = 0.5;
		whiteNoise.connect(fricativeFilter);
		fricativeFilter.connect(this.scriptProcessor);

		whiteNoise.start(0);
	},

	createWhiteNoiseNode: function (frameCount) {
		var myArrayBuffer = this.audioContext.createBuffer(1, frameCount, sampleRate);

		var nowBuffering = myArrayBuffer.getChannelData(0);
		for (var i = 0; i < frameCount; i++) {
			nowBuffering[i] = Math.random(); // gaussian();
		}

		var source = this.audioContext.createBufferSource();
		source.buffer = myArrayBuffer;
		source.loop = true;

		return source;
	},


	doScriptProcessor: function (event) {
		var inputArray1 = event.inputBuffer.getChannelData(0);
		var inputArray2 = event.inputBuffer.getChannelData(1);
		var outArray = event.outputBuffer.getChannelData(0);
		for (var j = 0, N = outArray.length; j < N; j++) {
			var lambda1 = j / N;
			var lambda2 = (j + 0.5) / N;
			var glottalOutput = Glottis.runStep(lambda1, inputArray1[j]);

			var vocalOutput = 0;
			//Tract runs at twice the sample rate 
			Tract.runStep(glottalOutput, inputArray2[j], lambda1);
			vocalOutput += Tract.lipOutput + Tract.noseOutput;
			Tract.runStep(glottalOutput, inputArray2[j], lambda2);
			vocalOutput += Tract.lipOutput + Tract.noseOutput;
			outArray[j] = vocalOutput * 0.125;
		}
		Glottis.finishBlock();
		Tract.finishBlock();
	},

	mute: function () {
		this.scriptProcessor.disconnect();
	},

	unmute: function () {
		this.scriptProcessor.connect(this.audioContext.destination);
	}
};

var Glottis = {
	timeInWaveform: 0,
	oldFrequency: 140,
	newFrequency: 140,
	UIFrequency: 140,
	smoothFrequency: 140,
	oldTenseness: 0.6,
	newTenseness: 0.6,
	UITenseness: 0.6,
	totalTime: 0,
	vibratoAmount: 0.005,
	vibratoFrequency: 6,
	intensity: 0,
	loudness: 1,
	isTouched: false,

	init: function () {
		this.setupWaveform(0);
	},

	runStep: function (lambda, noiseSource) {
		var timeStep = 1.0 / sampleRate;
		this.timeInWaveform += timeStep;
		this.totalTime += timeStep;
		if (this.timeInWaveform > this.waveformLength) {
			this.timeInWaveform -= this.waveformLength;
			this.setupWaveform(lambda);
		}
		var out = this.normalizedLFWaveform(this.timeInWaveform / this.waveformLength);
		var aspiration = this.intensity * (1 - Math.sqrt(this.UITenseness)) * this.getNoiseModulator() * noiseSource;
		aspiration *= 0.2 + 0.02 * module.simplex1(this.totalTime * 1.99);
		out += aspiration;
		return out;
	},

	getNoiseModulator: function () {
		var voiced = 0.1 + 0.2 * Math.max(0, Math.sin(Math.PI * 2 * this.timeInWaveform / this.waveformLength));
		//return 0.3;
		return this.UITenseness * this.intensity * voiced + (1 - this.UITenseness * this.intensity) * 0.3;
	},

	finishBlock: function () {
		var vibrato = 0;
		vibrato += this.vibratoAmount * Math.sin(2 * Math.PI * this.totalTime * this.vibratoFrequency);
		vibrato += 0.02 * module.simplex1(this.totalTime * 4.07);
		vibrato += 0.04 * module.simplex1(this.totalTime * 2.15);
		if (this.UIFrequency > this.smoothFrequency)
			this.smoothFrequency = Math.min(this.smoothFrequency * 1.1, this.UIFrequency);
		if (this.UIFrequency < this.smoothFrequency)
			this.smoothFrequency = Math.max(this.smoothFrequency / 1.1, this.UIFrequency);
		this.oldFrequency = this.newFrequency;
		this.newFrequency = this.smoothFrequency * (1 + vibrato);
		this.oldTenseness = this.newTenseness;
		this.newTenseness = this.UITenseness +
			0.1 * module.simplex1(this.totalTime * 0.46) + 0.05 * module.simplex1(this.totalTime * 0.36);
		if (!this.isTouched && alwaysVoice) this.newTenseness += (3 - this.UITenseness) * (1 - this.intensity);

		if (this.isTouched || alwaysVoice) this.intensity += 0.13;
		else this.intensity -= 0.05;
		this.intensity = clamp(this.intensity, 0, 1);
	},

	setupWaveform: function (lambda) {
		this.frequency = this.oldFrequency * (1 - lambda) + this.newFrequency * lambda;
		var tenseness = this.oldTenseness * (1 - lambda) + this.newTenseness * lambda;
		this.Rd = 3 * (1 - tenseness);
		this.waveformLength = 1.0 / this.frequency;

		var Rd = this.Rd;
		if (Rd < 0.5) Rd = 0.5;
		if (Rd > 2.7) Rd = 2.7;
		// normalized to time = 1, Ee = 1
		var Ra = -0.01 + 0.048 * Rd;
		var Rk = 0.224 + 0.118 * Rd;
		var Rg = (Rk / 4) * (0.5 + 1.2 * Rk) / (0.11 * Rd - Ra * (0.5 + 1.2 * Rk));

		var Ta = Ra;
		var Tp = 1 / (2 * Rg);
		var Te = Tp + Tp * Rk; //

		var epsilon = 1 / Ta;
		var shift = Math.exp(-epsilon * (1 - Te));
		var Delta = 1 - shift; //divide by this to scale RHS

		var RHSIntegral = (1 / epsilon) * (shift - 1) + (1 - Te) * shift;
		RHSIntegral = RHSIntegral / Delta;

		var totalLowerIntegral = -(Te - Tp) / 2 + RHSIntegral;
		var totalUpperIntegral = -totalLowerIntegral;

		var omega = Math.PI / Tp;
		var s = Math.sin(omega * Te);
		// need E0*e^(alpha*Te)*s = -1 (to meet the return at -1)
		// and E0*e^(alpha*Tp/2) * Tp*2/pi = totalUpperIntegral 
		//             (our approximation of the integral up to Tp)
		// writing x for e^alpha,
		// have E0*x^Te*s = -1 and E0 * x^(Tp/2) * Tp*2/pi = totalUpperIntegral
		// dividing the second by the first,
		// letting y = x^(Tp/2 - Te),
		// y * Tp*2 / (pi*s) = -totalUpperIntegral;
		var y = -Math.PI * s * totalUpperIntegral / (Tp * 2);
		var z = Math.log(y);
		var alpha = z / (Tp / 2 - Te);
		var E0 = -1 / (s * Math.exp(alpha * Te));
		this.alpha = alpha;
		this.E0 = E0;
		this.epsilon = epsilon;
		this.shift = shift;
		this.Delta = Delta;
		this.Te = Te;
		this.omega = omega;
	},

	normalizedLFWaveform: function (t) {
		var output;
		if (t > this.Te) output = (-Math.exp(-this.epsilon * (t - this.Te)) + this.shift) / this.Delta;
		else output = this.E0 * Math.exp(this.alpha * t) * Math.sin(this.omega * t);

		return output * this.intensity * this.loudness;
	}
};


var Tract = {
	n: 44,
	bladeStart: 10,
	tipStart: 32,
	lipStart: 39,
	R: [], //component going right
	L: [], //component going left
	reflection: [],
	junctionOutputR: [],
	junctionOutputL: [],
	maxAmplitude: [],
	diameter: [],
	restDiameter: [],
	targetDiameter: [],
	newDiameter: [],
	A: [],
	glottalReflection: 0.75,
	lipReflection: -0.85,
	lastObstruction: -1,
	fade: 1.0, //0.9999,
	movementSpeed: 15, //cm per second
	transients: [],
	lipOutput: 0,
	noseOutput: 0,
	velumTarget: 0.01,

	init: function () {
		this.bladeStart = Math.floor(this.bladeStart * this.n / 44);
		this.tipStart = Math.floor(this.tipStart * this.n / 44);
		this.lipStart = Math.floor(this.lipStart * this.n / 44);
		this.diameter = new Float64Array(this.n);
		this.restDiameter = new Float64Array(this.n);
		this.targetDiameter = new Float64Array(this.n);
		this.newDiameter = new Float64Array(this.n);
		for (var i = 0; i < this.n; i++) {
			var diameter = 0;
			if (i < 7 * this.n / 44 - 0.5) diameter = 0.6;
			else if (i < 12 * this.n / 44) diameter = 1.1;
			else diameter = 1.5;
			this.diameter[i] = this.restDiameter[i] = this.targetDiameter[i] = this.newDiameter[i] = diameter;
		}
		this.R = new Float64Array(this.n);
		this.L = new Float64Array(this.n);
		this.reflection = new Float64Array(this.n + 1);
		this.newReflection = new Float64Array(this.n + 1);
		this.junctionOutputR = new Float64Array(this.n + 1);
		this.junctionOutputL = new Float64Array(this.n + 1);
		this.A = new Float64Array(this.n);
		this.maxAmplitude = new Float64Array(this.n);

		this.noseLength = Math.floor(28 * this.n / 44);
		this.noseStart = this.n - this.noseLength + 1;
		this.noseR = new Float64Array(this.noseLength);
		this.noseL = new Float64Array(this.noseLength);
		this.noseJunctionOutputR = new Float64Array(this.noseLength + 1);
		this.noseJunctionOutputL = new Float64Array(this.noseLength + 1);
		this.noseReflection = new Float64Array(this.noseLength + 1);
		this.noseDiameter = new Float64Array(this.noseLength);
		this.noseA = new Float64Array(this.noseLength);
		this.noseMaxAmplitude = new Float64Array(this.noseLength);
		for (var i = 0; i < this.noseLength; i++) {
			var diameter;
			var d = 2 * (i / this.noseLength);
			if (d < 1) diameter = 0.4 + 1.6 * d;
			else diameter = 0.5 + 1.5 * (2 - d);
			diameter = Math.min(diameter, 1.9);
			this.noseDiameter[i] = diameter;
		}
		this.newReflectionLeft = this.newReflectionRight = this.newReflectionNose = 0;
		this.calculateReflections();
		this.calculateNoseReflections();
		this.noseDiameter[0] = this.velumTarget;
	},

	reshapeTract: function (deltaTime) {
		var amount = deltaTime * this.movementSpeed;		var newLastObstruction = -1;
		for (var i = 0; i < this.n; i++) {
			var diameter = this.diameter[i];
			var targetDiameter = this.targetDiameter[i];
			if (diameter <= 0) newLastObstruction = i;
			var slowReturn;
			if (i < this.noseStart) slowReturn = 0.6;
			else if (i >= this.tipStart) slowReturn = 1.0;
			else slowReturn = 0.6 + 0.4 * (i - this.noseStart) / (this.tipStart - this.noseStart);
			this.diameter[i] = moveTowards(diameter, targetDiameter, slowReturn * amount, 2 * amount);
		}
		if (this.lastObstruction > -1 && newLastObstruction == -1 && this.noseA[0] < 0.05) {
			this.addTransient(this.lastObstruction);
		}
		this.lastObstruction = newLastObstruction;

		amount = deltaTime * this.movementSpeed;
		this.noseDiameter[0] = moveTowards(this.noseDiameter[0], this.velumTarget,
			amount * 0.25, amount * 0.1);
		this.noseA[0] = this.noseDiameter[0] * this.noseDiameter[0];
	},

	calculateReflections: function () {
		for (var i = 0; i < this.n; i++) {
			this.A[i] = this.diameter[i] * this.diameter[i]; //ignoring PI etc.
		}
		for (var i = 1; i < this.n; i++) {
			this.reflection[i] = this.newReflection[i];
			if (this.A[i] == 0) this.newReflection[i] = 0.999; //to prevent some bad behaviour if 0
			else this.newReflection[i] = (this.A[i - 1] - this.A[i]) / (this.A[i - 1] + this.A[i]);
		}

		//now at junction with nose

		this.reflectionLeft = this.newReflectionLeft;
		this.reflectionRight = this.newReflectionRight;
		this.reflectionNose = this.newReflectionNose;
		var sum = this.A[this.noseStart] + this.A[this.noseStart + 1] + this.noseA[0];
		this.newReflectionLeft = (2 * this.A[this.noseStart] - sum) / sum;
		this.newReflectionRight = (2 * this.A[this.noseStart + 1] - sum) / sum;
		this.newReflectionNose = (2 * this.noseA[0] - sum) / sum;
	},

	calculateNoseReflections: function () {
		for (var i = 0; i < this.noseLength; i++) {
			this.noseA[i] = this.noseDiameter[i] * this.noseDiameter[i];
		}
		for (var i = 1; i < this.noseLength; i++) {
			this.noseReflection[i] = (this.noseA[i - 1] - this.noseA[i]) / (this.noseA[i - 1] + this.noseA[i]);
		}
	},

	runStep: function (glottalOutput, turbulenceNoise, lambda) {
		var updateAmplitudes = (Math.random() < 0.1);

		//mouth
		this.processTransients();

		//this.glottalReflection = -0.8 + 1.6 * Glottis.newTenseness;
		this.junctionOutputR[0] = this.L[0] * this.glottalReflection + glottalOutput;
		this.junctionOutputL[this.n] = this.R[this.n - 1] * this.lipReflection;

		for (var i = 1; i < this.n; i++) {
			var r = this.reflection[i] * (1 - lambda) + this.newReflection[i] * lambda;
			var w = r * (this.R[i - 1] + this.L[i]);
			this.junctionOutputR[i] = this.R[i - 1] - w;
			this.junctionOutputL[i] = this.L[i] + w;
		}

		//now at junction with nose
		var i = this.noseStart;
		var r = this.newReflectionLeft * (1 - lambda) + this.reflectionLeft * lambda;
		this.junctionOutputL[i] = r * this.R[i - 1] + (1 + r) * (this.noseL[0] + this.L[i]);
		r = this.newReflectionRight * (1 - lambda) + this.reflectionRight * lambda;
		this.junctionOutputR[i] = r * this.L[i] + (1 + r) * (this.R[i - 1] + this.noseL[0]);
		r = this.newReflectionNose * (1 - lambda) + this.reflectionNose * lambda;
		this.noseJunctionOutputR[0] = r * this.noseL[0] + (1 + r) * (this.L[i] + this.R[i - 1]);

		for (var i = 0; i < this.n; i++) {
			this.R[i] = this.junctionOutputR[i] * 0.999;
			this.L[i] = this.junctionOutputL[i + 1] * 0.999;

			//this.R[i] = clamp(this.junctionOutputR[i] * this.fade, -1, 1);
			//this.L[i] = clamp(this.junctionOutputL[i+1] * this.fade, -1, 1);    

			if (updateAmplitudes) {
				var amplitude = Math.abs(this.R[i] + this.L[i]);
				if (amplitude > this.maxAmplitude[i]) this.maxAmplitude[i] = amplitude;
				else this.maxAmplitude[i] *= 0.999;
			}
		}

		this.lipOutput = this.R[this.n - 1];

		//nose     
		this.noseJunctionOutputL[this.noseLength] = this.noseR[this.noseLength - 1] * this.lipReflection;

		for (var i = 1; i < this.noseLength; i++) {
			var w = this.noseReflection[i] * (this.noseR[i - 1] + this.noseL[i]);
			this.noseJunctionOutputR[i] = this.noseR[i - 1] - w;
			this.noseJunctionOutputL[i] = this.noseL[i] + w;
		}

		for (var i = 0; i < this.noseLength; i++) {
			this.noseR[i] = this.noseJunctionOutputR[i] * this.fade;
			this.noseL[i] = this.noseJunctionOutputL[i + 1] * this.fade;

			//this.noseR[i] = clamp(this.noseJunctionOutputR[i] * this.fade, -1, 1);
			//this.noseL[i] = clamp(this.noseJunctionOutputL[i+1] * this.fade, -1, 1);    

			if (updateAmplitudes) {
				var amplitude = Math.abs(this.noseR[i] + this.noseL[i]);
				if (amplitude > this.noseMaxAmplitude[i]) this.noseMaxAmplitude[i] = amplitude;
				else this.noseMaxAmplitude[i] *= 0.999;
			}
		}

		this.noseOutput = this.noseR[this.noseLength - 1];

	},

	finishBlock: function () {
		this.reshapeTract(AudioSystem.blockTime);
		this.calculateReflections();
	},

	addTransient: function (position) {
		var trans = {};
		trans.position = position;
		trans.timeAlive = 0;
		trans.lifeTime = 0.2;
		trans.strength = 0.3;
		trans.exponent = 200;
		this.transients.push(trans);
	},

	processTransients: function () {
		for (var i = 0; i < this.transients.length; i++) {
			var trans = this.transients[i];
			var amplitude = trans.strength * Math.pow(2, -trans.exponent * trans.timeAlive);
			this.R[trans.position] += amplitude / 2;
			this.L[trans.position] += amplitude / 2;
			trans.timeAlive += 1.0 / (sampleRate * 2);
		}
		for (var i = this.transients.length - 1; i >= 0; i--) {
			var trans = this.transients[i];
			if (trans.timeAlive > trans.lifeTime) {
				this.transients.splice(i, 1);
			}
		}
	},
};

AudioSystem.init();
Glottis.init();
Tract.init();

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
*/

/*
Helper used to replace code in a script tag based on a search regex
To inject code without erasing original string, using capturing groups; e.g.
	inject(/(some string)/,'injected before $1 injected after')
*/
function inject(searchRegex, replaceString) {
	// find the relevant script tag
	var scriptTags = document.getElementsByTagName('script');
	var scriptTag;
	var code;
	for (var i = 0; i < scriptTags.length; ++i) {
		scriptTag = scriptTags[i];
		var matchesSearch = scriptTag.textContent.search(searchRegex) !== -1;
		var isCurrentScript = scriptTag === document.currentScript;
		if (matchesSearch && !isCurrentScript) {
			code = scriptTag.textContent;
			break;
		}
	}

	// error-handling
	if (!code) {
		throw new Error('Couldn\'t find "' + searchRegex + '" in script tags');
	}

	// modify the content
	code = code.replace(searchRegex, replaceString);

	// replace the old script tag with a new one using our modified code
	var newScriptTag = document.createElement('script');
	newScriptTag.textContent = code;
	scriptTag.insertAdjacentElement('afterend', newScriptTag);
	scriptTag.remove();
}

/**
 * Helper for getting an array with unique elements
 * @param  {Array} array Original array
 * @return {Array}       Copy of array, excluding duplicates
 */
function unique(array) {
	return array.filter(function (item, idx) {
		return array.indexOf(item) === idx;
	});
}

/**
 * @param {number} value number to clamp
 * @param {number} min minimum
 * @param {number} max maximum
 * @return min if value < min, max if value > max, value otherwise
 */
function clamp$1(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@version 4.0.1
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
HOW TO USE:
  import {before, after, inject, addDialogTag, addDeferredDialogTag} from "./helpers/kitsy-script-toolkit";

  before(targetFuncName, beforeFn);
  after(targetFuncName, afterFn);
  inject(searchRegex, replaceString);
  addDialogTag(tagName, dialogFn);
  addDeferredDialogTag(tagName, dialogFn);

  For more info, see the documentation at:
  https://github.com/seleb/bitsy-hacks/wiki/Coding-with-kitsy
*/


// Ex: inject(/(names.sprite.set\( name, id \);)/, '$1console.dir(names)');
function inject$1(searchRegex, replaceString) {
	var kitsy = kitsyInit();
	kitsy.queuedInjectScripts.push({
		searchRegex: searchRegex,
		replaceString: replaceString
	});
}

// Ex: before('load_game', function run() { alert('Loading!'); });
//     before('show_text', function run(text) { return text.toUpperCase(); });
//     before('show_text', function run(text, done) { done(text.toUpperCase()); });
function before(targetFuncName, beforeFn) {
	var kitsy = kitsyInit();
	kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
	kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
}

// Ex: after('load_game', function run() { alert('Loaded!'); });
function after(targetFuncName, afterFn) {
	var kitsy = kitsyInit();
	kitsy.queuedAfterScripts[targetFuncName] = kitsy.queuedAfterScripts[targetFuncName] || [];
	kitsy.queuedAfterScripts[targetFuncName].push(afterFn);
}

function kitsyInit() {
	// return already-initialized kitsy
	if (bitsy.kitsy) {
		return bitsy.kitsy;
	}

	// Initialize kitsy
	bitsy.kitsy = {
		queuedInjectScripts: [],
		queuedBeforeScripts: {},
		queuedAfterScripts: {}
	};

	var oldStartFunc = bitsy.startExportedGame;
	bitsy.startExportedGame = function doAllInjections() {
		// Only do this once.
		bitsy.startExportedGame = oldStartFunc;

		// Rewrite scripts and hook everything up.
		doInjects();
		applyAllHooks();

		// Start the game
		bitsy.startExportedGame.apply(this, arguments);
	};

	return bitsy.kitsy;
}


function doInjects() {
	bitsy.kitsy.queuedInjectScripts.forEach(function (injectScript) {
		inject(injectScript.searchRegex, injectScript.replaceString);
	});
	_reinitEngine();
}

function applyAllHooks() {
	var allHooks = unique(Object.keys(bitsy.kitsy.queuedBeforeScripts).concat(Object.keys(bitsy.kitsy.queuedAfterScripts)));
	allHooks.forEach(applyHook);
}

function applyHook(functionName) {
	var functionNameSegments = functionName.split('.');
	var obj = bitsy;
	while (functionNameSegments.length > 1) {
		obj = obj[functionNameSegments.shift()];
	}
	var lastSegment = functionNameSegments[0];
	var superFn = obj[lastSegment];
	var superFnLength = superFn ? superFn.length : 0;
	var functions = [];
	// start with befores
	functions = functions.concat(bitsy.kitsy.queuedBeforeScripts[functionName] || []);
	// then original
	if (superFn) {
		functions.push(superFn);
	}
	// then afters
	functions = functions.concat(bitsy.kitsy.queuedAfterScripts[functionName] || []);

	// overwrite original with one which will call each in order
	obj[lastSegment] = function () {
		var returnVal;
		var args = [].slice.call(arguments);
		var i = 0;

		function runBefore() {
			// All outta functions? Finish
			if (i === functions.length) {
				return returnVal;
			}

			// Update args if provided.
			if (arguments.length > 0) {
				args = [].slice.call(arguments);
			}

			if (functions[i].length > superFnLength) {
				// Assume funcs that accept more args than the original are
				// async and accept a callback as an additional argument.
				return functions[i++].apply(this, args.concat(runBefore.bind(this)));
			} else {
				// run synchronously
				returnVal = functions[i++].apply(this, args);
				if (returnVal && returnVal.length) {
					args = returnVal;
				}
				return runBefore.apply(this, args);
			}
		}

		return runBefore.apply(this, arguments);
	};
}

function _reinitEngine() {
	// recreate the script and dialog objects so that they'll be
	// referencing the code with injections instead of the original
	bitsy.scriptModule = new bitsy.Script();
	bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();

	bitsy.dialogModule = new bitsy.Dialog();
	bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
	bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();
}

// Rewrite custom functions' parentheses to curly braces for Bitsy's
// interpreter. Unescape escaped parentheticals, too.
function convertDialogTags(input, tag) {
	return input
		.replace(new RegExp('\\\\?\\((' + tag + '(\\s+(".+?"|.+?))?)\\\\?\\)', 'g'), function (match, group) {
			if (match.substr(0, 1) === '\\') {
				return '(' + group + ')'; // Rewrite \(tag "..."|...\) to (tag "..."|...)
			}
			return '{' + group + '}'; // Rewrite (tag "..."|...) to {tag "..."|...}
		});
}


function addDialogFunction(tag, fn) {
	var kitsy = kitsyInit();
	kitsy.dialogFunctions = kitsy.dialogFunctions || {};
	if (kitsy.dialogFunctions[tag]) {
		throw new Error('The dialog function "' + tag + '" already exists.');
	}

	// Hook into game load and rewrite custom functions in game data to Bitsy format.
	before('parseWorld', function (game_data) {
		return [convertDialogTags(game_data, tag)];
	});

	kitsy.dialogFunctions[tag] = fn;
}

function injectDialogTag(tag, code) {
	inject$1(
		/(var functionMap = new Map\(\);[^]*?)(this.HasFunction)/m,
		'$1\nfunctionMap.set("' + tag + '", ' + code + ');\n$2'
	);
}

/**
 * Adds a custom dialog tag which executes the provided function.
 * For ease-of-use with the bitsy editor, tags can be written as
 * (tagname "parameters") in addition to the standard {tagname "parameters"}
 * 
 * Function is executed immediately when the tag is reached.
 *
 * @param {string}   tag Name of tag
 * @param {Function} fn  Function to execute, with signature `function(environment, parameters, onReturn){}`
 *                       environment: provides access to SetVariable/GetVariable (among other things, see Environment in the bitsy source for more info)
 *                       parameters: array containing parameters as string in first element (i.e. `parameters[0]`)
 *                       onReturn: function to call with return value (just call `onReturn(null);` at the end of your function if your tag doesn't interact with the logic system)
 */
function addDialogTag(tag, fn) {
	addDialogFunction(tag, fn);
	injectDialogTag(tag, 'kitsy.dialogFunctions["' + tag + '"]');
}

/**
💬
@file dialog audio
@summary animal crossing-style audio
@license MIT
@version 1.0.3
@author Sean S. LeBlanc

@description
Executes some logic for every letter of text printed,
with a default implementation of animal crossing-style audio.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit `onLetter` below as needed
*/

var hackOptions = {
	// function called for each character printed to the dialog box
	// the single parameter is the character with the following properties:
	// 	offset: offset from actual position in pixels. starts at {x:0, y:0}
	// 	color: color of rendered text in [0-255]. starts at {r:255, g:255, b:255, a:255}
	// 	bitmap: character bitmap as array of pixels
	// 	row: vertical position in rows
	// 	col: horizontal position in characters
	// 	char: the letter as a string (note: this is hacked in)
	//
	// this function can be customized to create a variety of effects,
	// but a default implementation is provided which will play a sound
	// mapped by letter to an HTML audio tag with a specific id, e.g. <audio id="dialog-a" src="./a.mp3"></audio>
	//
	// some examples of how this could be modified for more complex audio:
	// 	- set `audioEl.volume` based on character position
	// 	- use `bitsy.scriptInterpreter.GetVariable('voice')` to map to a different set of sounds
	// 	- use an HTML5 AudioContext or library instead of audio tags to control pitch or play generative audio
	//
	// note that the character may not always be defined (e.g. during bitsy dialog commands)
	// so be sure to guard against null data if modifying the implementation
	onLetter: function (dialogChar) {
		var character = (dialogChar || {}).char || '';
		var id = 'dialog-' + character.toLowerCase();
		var audioEl = document.getElementById(id);
		if (audioEl) {
			audioEl.currentTime = 0.0;
			audioEl.play();
		}
	},
};

// save the character on dialog font characters so we can read it back post-render
inject$1(/(function DialogFontChar\(font, char, effectList\) {)/, '$1\nthis.char = char;');

// hook up letter function
before('dialogBuffer.DoNextChar', function () {
	hackOptions.onLetter(bitsy.dialogBuffer.CurChar());
});





var defaultVoice;
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

hackOptions.onLetter = function (character) {
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
		var adjustAmount = 1.0 - clamp$1(distanceFromAdjust / adjustSize, 0, 1);
		return lerp(v, v * adjustAmp, adjustAmount);
	});

	adjustPoint = getValue(voice.tonguePosition || defaultVoice.tonguePosition);
	adjustSize = getValue(voice.tongueSize || defaultVoice.tongueSize);
	adjustAmp = getValue(voice.tongueAmount || defaultVoice.tongueAmount);
	Tract.targetDiameter = Tract.targetDiameter.map((v, i) => {
		var pointInTract = i / l;
		var distanceFromAdjust = Math.abs(adjustPoint - pointInTract);
		var adjustAmount = 1.0 - clamp$1(distanceFromAdjust / adjustSize, 0, 1);
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
	if (hackOptions$1.autoReset) {
		voice = defaultVoice;
		resetTract();
		applyVoice();
	}
});

addDialogTag('voice', function (environment, parameters, onReturn) {
	voice = hackOptions$1.voices[parameters[0]] || defaultVoice;
	onReturn(null);
});

after('onready', function () {
	defaultVoice = hackOptions$1.voices.default;
	voice = defaultVoice;
});

exports.hackOptions = hackOptions$1;

}(this.hacks.dialog_audio_vocal_synth = this.hacks.dialog_audio_vocal_synth || {}, window));

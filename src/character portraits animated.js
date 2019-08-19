/**
🙀
@file character portraits animated
@summary high quality anime gifs
@license MIT
@version 1.0.4
@requires Bitsy Version: 5.3
@author Sean S. LeBlanc

@description
An expanded version of the character portraits hack
that includes support for animated GIFs.

See base character portraits hack for more info.

Notes:
	- GIFs have to be fetched asynchronously, which means they won't work by default
	  when running from a local file in chrome. They will work in firefox or when run from a server.
	- Individual frame delays are respected
	  (you can use frame delays instead of duplicated frames to optimize pauses)
	- Non-looping GIFs are supported
	- Non-GIFs which work with the base hack are supported
	- This hack is larger, more complicated, and less performant
	  than the base portrait hack, so if you're not using animations
	  make sure to use the base one instead

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit the hackOptions object as needed
*/
import {
	GifReader,
} from 'omggif';
import bitsy from 'bitsy';
import {
	hackOptions as portraitHackOptions,
	state,
} from './character portraits';
import {
	after,
	before,
} from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	// overrides for the base hack
	scale: bitsy.scale,
	autoReset: true,
	portraits: {
		'earth': './GIF.gif',
		'cat': './test-export.gif',
		'png': './test.gif',
	},
};

before('startExportedGame', function () {
	portraitHackOptions.portraits = hackOptions.portraits;
	portraitHackOptions.scale = hackOptions.scale;
	portraitHackOptions.autoReset = hackOptions.autoReset;
});

// convert portrait state to new format supporting multiple frames
// and load the frames of animated gifs
after('startExportedGame', function () {
	for (var portrait in state.portraits) {
		if (Object.prototype.hasOwnProperty.call(state.portraits, portrait)) {
			var src = state.portraits[portrait].src;

			if (src.substr(-4).toUpperCase() !== '.GIF') {
				state.portraits[portrait] = {
					loop: false,
					duration: 0,
					frames: [{
						delay: 0,
						img: state.portraits[portrait],
					}],
				};
				continue;
			}

			fetch(src)
				.then(function (response) {
					return response.arrayBuffer();
				})
				.then(function (arrayBuffer) {
					var data = new window.Uint8Array(arrayBuffer);
					var reader = new GifReader(data);
					var numFrames = reader.numFrames();
					var width = reader.width;
					var height = reader.height;
					var prev = document.createElement('canvas');
					prev.width = width;
					prev.height = height;
					var prevCtx = prev.getContext('2d');
					var frames = [];
					var duration = 0;
					for (var i = 0; i < numFrames; ++i) {
						var canvas = document.createElement('canvas');
						canvas.width = width;
						canvas.height = height;
						var ctx = canvas.getContext('2d');
						var imgData = ctx.createImageData(width, height);
						reader.decodeAndBlitFrameRGBA(i, imgData.data);
						ctx.putImageData(imgData, 0, 0);
						if (reader.frameInfo(i).disposal === 2) { // handle bg dispose
							prevCtx.clearRect(0, 0, prev.width, prev.height);
						}
						prevCtx.drawImage(canvas, 0, 0);
						ctx.drawImage(prev, 0, 0);
						var delay = Math.max(1 / 60 * 1000, reader.frameInfo(i).delay * 10); // maximum speed of 60fps
						duration += delay;
						frames.push({
							img: canvas,
							delay,
						});
					}
					state.portraits[this] = {
						loop: reader.loopCount() !== null, // either loop infinitely or only place once; ignores other loop counts for now
						duration,
						frames,
					};
				}.bind(portrait));
		}
	}
});

// override portrait drawing to use frames
var animation;
var animationStart = 0;
before('drawRoom', function () {
	if (animation !== state.portrait) {
		animationStart = bitsy.prevTime;
	}
	animation = state.portrait;
	if (animation) {
		var frame;
		var t = bitsy.prevTime - animationStart;
		if (t >= animation.duration) {
			if (animation.loop) {
				animationStart += animation.duration;
				frame = 0;
			} else {
				frame = animation.frames.length - 1;
			}
		} else {
			for (frame = 0; frame < animation.frames.length - 1; ++frame) {
				t -= animation.frames[frame].delay;
				if (t <= 0) {
					break;
				}
			}
		}
		state.portrait = animation.frames[frame].img;
	}
});
after('drawRoom', function () {
	state.portrait = animation;
});

/**
😽
@file character portraits
@summary high quality anime jpegs (or pngs i guess)
@license MIT
@author Sean S. LeBlanc

@description
Adds a tag (portrait "id") which adds the ability to draw high resolution images during dialog.

Examples:
	(portrait "cat")
		draws the image named "cat" in the hackOptions
	(portrait "")
		resets the portrait to not draw

By default, the portrait will clear when dialog is exited,
but this can be customized in the hackOptions below.

All portraits are drawn from the top-left corner, on top of the game and below the dialog box.
They are scaled uniformly according to the hackOptions below,
and are cropped to bitsy's canvas width/height.

All portraits are preloaded, but their loading state is ignored.
i.e. The game will start before they have all loaded,
and they simply won't draw if they're not loaded or have errored out.

All standard browser image formats are supported, but keep filesize in mind!

Notes:
- The hack is called "character portraits", but this can easily be used to show images of any sort
- Images drawn with this hack may taint bitsy's canvas, preventing exit transitions from working.
  You can avoid this by only using images hosted alongside your game on a server.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit the hackOptions object as needed
*/
import bitsy from 'bitsy';
import { addDialogTag, after } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	// influences the resolution of the drawn image
	// `bitsy.scale` (4 by default) is the max and will match bitsy's internal scale (i.e. 512x512)
	// 1 will match bitsy's in-game virtual scale (i.e. 128x128)
	// it's best to decide this up-front and make portrait images that match this resolution
	scale: bitsy.scale,
	// a list of portrait files
	// the format is: 'id for portrait tag': 'file path'
	// these may be:
	// - local files (in which case you need to include them with your html when publishing)
	// - online urls (which are not guaranteed to work as they are network-dependent)
	// - base64-encoded images (the most reliable but unwieldy)
	portraits: {
		cat: './cat.png',
	},
	autoReset: true, // if true, automatically resets the portrait to blank when dialog is exited
	dialogOnly: true, // if true, portrait is only shown when dialog is active
};

export var state = {
	portraits: {},
	portrait: null,
};

// preload images into a cache
after('startExportedGame', function () {
	Object.keys(hackOptions.portraits).forEach(function (i) {
		state.portraits[i] = new Image();
		state.portraits[i].src = hackOptions.portraits[i];
	});
});

// hook up dialog tag
addDialogTag('portrait', function (environment, parameters, onReturn) {
	var newPortrait = parameters[0];
	var image = state.portraits[newPortrait];
	if (state.portrait === image) {
		onReturn(null);
		return;
	}
	state.portrait = image;
	onReturn(null);
});

// draw portrait on top of screen
after('bitsy._graphics.drawImage', function (id) {
	// eslint-disable-next-line no-underscore-dangle
	var layers = bitsy.bitsy._getTileMapLayers();
	if (id !== layers[layers.length - 1] || (hackOptions.dialogOnly && !bitsy.isDialogMode && !bitsy.isNarrating) || !state.portrait) return;
	// eslint-disable-next-line no-underscore-dangle
	var context = bitsy.bitsy._getContext();
	try {
		context.drawImage(state.portrait, 0, 0, bitsy.width * hackOptions.scale, bitsy.height * hackOptions.scale, 0, 0, bitsy.width * bitsy.scale, bitsy.height * bitsy.scale);
	} catch (error) {
		// log and ignore errors
		// so broken images don't break the game
		console.error('Portrait error', error);
	}
});

after('onExitDialog', function () {
	if (hackOptions.autoReset) {
		state.portrait = '';
	}
});

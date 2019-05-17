/**
😽
@file character portraits
@summary high quality anime jpegs (or pngs i guess)
@license MIT
@version 1.1.1
@requires Bitsy Version: 5.3
@author Sean S. LeBlanc

@description
Adds a tag (portrait "id") which adds the ability to draw high resolution images during dialog.

Examples:
	(portrait "cat")
		draws the image named "cat" in the hackOptions
	(portrait "")
		resets the portrait to not draw

All portraits are drawn from the top-left corner, on top of the game and below the dialog box.
They are scaled uniformly according to the hackOptions below,
and are cropped to bitsy's canvas width/height.

All portraits are preloaded, but their loading state is ignored.
i.e. The game will start before they have all loaded,
and they simply won't draw if they're not loaded or have errored out.

All standard browser image formats are supported, but keep filesize in mind!

Note: The hack is called "character portraits", but this can easily be used to show images of any sort

HOW TO USE:
Copy-paste into a script tag after the bitsy source
*/
import bitsy from "bitsy";
import {
	addDialogTag,
	after
} from "./helpers/kitsy-script-toolkit";

var hackOptions = {
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
		'cat': './cat.png',
	},
	autoReset: true, // if true, automatically resets the portrait to blank when dialog is exited
};

// preload images into a cache
var imgs = {};
for (var i in hackOptions.portraits) {
	if(hackOptions.portraits.hasOwnProperty(i)) {
		imgs[i] = new Image();
		imgs[i].src = hackOptions.portraits[i];
	}
}

// hook up dialog tag
var portrait = '';
addDialogTag('portrait', function (environment, parameters, onReturn) {
	var newPortrait = parameters[0];
	var image = imgs[newPortrait];
	if (portrait === image) {
		return;
	}
	portrait = image;
	onReturn(null);
});

// hook up drawing
var context;
after('drawRoom', function () {
	if ((!bitsy.isDialogMode && !bitsy.isNarrating) || !portrait) {
		return;
	}
	if (!context) {
		context = bitsy.canvas.getContext('2d');
	}
	try {
		context.drawImage(portrait, 0, 0, bitsy.width * hackOptions.scale, bitsy.height * hackOptions.scale, 0, 0, bitsy.width * bitsy.scale, bitsy.height * bitsy.scale);
	} catch (error) {
		// log and ignore errors
		// so broken images don't break the game
		console.error('Portrait error', error);
	}
});

after('onExitDialog', function() {
	if (hackOptions.autoReset) {
		portrait = '';
	}
});

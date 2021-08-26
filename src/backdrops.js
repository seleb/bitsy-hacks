/**
🖼
@file backdrops
@summary makes the game have a backdrop
@license MIT
@version auto
@requires Bitsy Version: 7.2
@author Cephalopodunk & Sean S. LeBlanc

@description
Shows backdrops behind the game

Note: includes transparent background/sprites

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
3. You may need to add `background-size: cover` to the #game CSS up above to get the backdrop to fit correctly in the game screen
*/
import bitsy from 'bitsy';
import { after, before } from './helpers/kitsy-script-toolkit';
import { hackOptions as transparentBackground } from './transparent background';

export var hackOptions = {
	// If true, backdrop changes will persist across rooms without a backdrop defined
	permanent: false,
	// Backdrops shown by room
	// Include an entry in this map for every room that you want to trigger a change,
	// and then specify the image source for the backdrop (generally a file path relative to your game's html file).
	// Expand the map to include as many rooms as you need.
	backdropsByRoom: {
		'room name or id': './images/image for room.png',
	},
	// Backdrop shown during title
	backdropTitle: './images/title.png',
	// transparent sprites option
	isTransparent: function (drawing) {
		// return drawing.name == 'tea'; // specific transparent drawing
		// return ['tea', 'flower', 'hat'].indexOf(drawing.name) !== -1; // specific transparent drawing list
		// return drawing.name && drawing.name.indexOf('TRANSPARENT') !== -1; // transparent drawing flag in name
		return true; // all drawings are transparent
	},
};

// pass through transparent sprites option
transparentBackground.isTransparent = function (drawing) {
	return hackOptions.isTransparent(drawing);
};

var imgCache = [];
after('loadGame', function () {
	// set base style
	var game = document.getElementById('game');
	game.style.backgroundSize = 'cover';
	game.style.backgroundColor = 'transparent';
	// preload images
	Object.values(hackOptions.backdropsByRoom)
		.concat([hackOptions.imageTitle, hackOptions.imageDefault])
		.filter(function (src) {
			return src;
		})
		.reduce(function (result, src) {
			var img = new Image();
			img.src = src;
			result.push(img);
			return result;
		}, imgCache);
});

// hook up backdrops
var currentBackdrop;
function setBackdrop(src) {
	if (src === currentBackdrop) {
		return;
	}
	currentBackdrop = src;
	var game = document.getElementById('game');
	if (!src) {
		game.style.backgroundImage = null;
		return;
	}
	game.style.backgroundImage = 'url("' + src + '")';
}

before('drawRoom', function () {
	var backdrop = hackOptions.backdropsByRoom[bitsy.player().room];
	// if no backdrop defined + not permanent, reset
	if (backdrop !== undefined || !hackOptions.permanent) {
		setBackdrop(backdrop);
	}
});

after('startNarrating', function (dialogStr, end) {
	if (!end) {
		setBackdrop(hackOptions.backdropTitle);
	}
});

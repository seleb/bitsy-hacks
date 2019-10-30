/**
💬
@file dialog audio
@summary animal crossing-style audio
@license MIT
@version 1.0.0
@author Sean S. LeBlanc

@description
Executes some logic for every letter of text printed,
with a default implementation of animal crossing-style audio.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit `onLetter` below as needed
*/
import bitsy from 'bitsy';
import { inject, before } from './helpers/kitsy-script-toolkit';

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
	onLetter: function(dialogChar) {
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
inject(/(function DialogFontChar\(font, char, effectList\) {)/, '$1\nthis.char = char;');

// hook up letter function
before('dialogBuffer.DoNextChar', function() {
	hackOptions.onLetter(bitsy.dialogBuffer.CurChar());
});

/**
⌨
@file custom-keyhandlers
@summary run custom code on key inputs
@license MIT
@version 1.0.0
@requires Bitsy Version: 7.0
@author Sean S. LeBlanc

@description
Adds an extra layer of key handlers to bitsy's input handling
that allow custom functions to be run on key press, key down, and key up events.

Some simple example functions:
	bitsy.scriptInterpreter.SetVariable('myvar', 10); // sets a variable that can be accessed in bitsy scripts
	bitsy.startDialog('a dialog string'); // starts a bitsy dialog script
	bitsy.startDialog(bitsy.dialog['script-id'], 'script-id'); // starts a bitsy dialog script by id
	bitsy.room[bitsy.curRoom].items.push({ id: 0, x: bitsy.player().x, y: bitsy.player().y }); // adds an item at the player's current position

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit the hackOptions object as needed
*/

import bitsy from 'bitsy';
import {
	after,
} from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	// each object below is a map of key -> handler
	// ondown is called when key is first pressed
	ondown: {
		z: function () {
			console.log('pressed z');
		},
	},
	// onheld is called every frame key is held
	// it includes a single parameter,
	// which is the number of frames the key has been held
	onheld: {
		z: function (f) {
			console.log('held z for ' + f + ' frames');
		},
	},
	// onup is called when key is released
	onup: {
		z: function () {
			console.log('released z');
		},
	},
};

var allHandlers = [];
var held = {};

after('onready', function () {
	held = {};
	allHandlers = Object.keys(hackOptions.ondown).concat(Object.keys(hackOptions.onheld), Object.keys(hackOptions.onup));
});

after('updateInput', function () {
	allHandlers.forEach(function (key) {
		var ondown = hackOptions.ondown[key];
		var onheld = hackOptions.onheld[key];
		var onup = hackOptions.onup[key];
		if (bitsy.input.isKeyDown(key.toUpperCase().codePointAt(0))) {
			var f = held[key] = (held[key] || 0) + 1;
			if (f === 1 && ondown) {
				ondown();
			}
			if (onheld) {
				onheld(f);
			}
		} else {
			if (held[key] > 0 && onup) {
				onup();
			}
			held[key] = 0;
		}
	});
});

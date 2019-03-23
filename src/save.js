/**
💾
@file save
@summary save/load your game
@license MIT
@version 1.0.2
@requires 5.4
@author Sean S. LeBlanc

@description
Introduces save/load functionality.

Includes:
	- data that may be saved/loaded:
		- current room/position within room
		- inventory/items in rooms
		- dialog variables
		- dialog position
	- basic autosave
	- dialog tags:
		- (save): saves game
		- (load ""): loads game; parameter is text to show as title on load
		- (clear): clears saved game
		- (saveNow)/(loadNow)/(clearNow): instant varieties of above tags

Notes:
	- Storage is implemented through browser localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
	  Remember to clear storage while working on a game, otherwise loading may prevent you from seeing your changes!
	  You can use the `clearOnStart` option to do this for you when testing.
	- This hack only tracks state which could be modified via vanilla bitsy features,
	  i.e. compatability with other hacks that modify state varies;
	  you may need to modify save/load to include/exclude things for compatability.
	  (feel free to ask for help tailoring these to your needs!)
	- There is only one "save slot"; it would not be too difficult to implement more,
	  but it adds a lot of complexity that most folks probably don't need.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
import bitsy from "bitsy";
import {
	after,
	addDualDialogTag,
	before,
} from "./helpers/kitsy-script-toolkit";
import {
	inject
} from "./helpers/utils";

export var hackOptions = {
	// when to save/load
	autosaveInterval: Infinity, // time in milliseconds between autosaves (never autosaves if Infinity)
	loadOnStart: true, // if true, loads save when starting
	clearOnEnd: false, // if true, deletes save when restarting after reaching an ending
	clearOnStart: false, // if true, deletes save when page is loaded (mostly for debugging)
	// what to save/load
	position: true, // if true, saves which room the player is in, and where they are in the room
	variables: true, // if true, saves dialog variables (note: does not include item counts)
	items: true, // if true, saves player inventory (i.e. item counts) and item placement in rooms
	dialog: true, // if true, saves dialog position (for sequences etc)
	key: 'snapshot', // where in localStorage to save/load data
};

function save() {
	var snapshot = {};
	if (hackOptions.position) {
		snapshot.room = bitsy.curRoom;
		snapshot.x = bitsy.player().x;
		snapshot.y = bitsy.player().y;
	}
	if (hackOptions.items) {
		snapshot.inventory = bitsy.player().inventory;
		snapshot.items = Object.entries(bitsy.room).map(function (room) {
			return [room[0], room[1].items];
		});
	}
	if (hackOptions.variables) {
		snapshot.variables = bitsy.scriptInterpreter.GetVariableNames().map(function (variable) {
			return [variable, bitsy.scriptInterpreter.GetVariable(variable)];
		});
	}
	if (hackOptions.dialog) {
		snapshot.sequenceIndices = bitsy.saveHack.sequenceIndices;
	}
	localStorage.setItem(hackOptions.key, JSON.stringify(snapshot));
}

function load() {
	var snapshot = localStorage.getItem(hackOptions.key);
	// if there's no save, abort load
	if (!snapshot) {
		return;
	}
	snapshot = JSON.parse(snapshot);

	if (hackOptions.position) {
		if (snapshot.room) {
			bitsy.curRoom = bitsy.player().room = snapshot.room;
		}
		if (snapshot.x && snapshot.y) {
			bitsy.player().x = snapshot.x;
			bitsy.player().y = snapshot.y;
		}
	}
	if (hackOptions.items) {
		if (snapshot.inventory) {
			bitsy.player().inventory = snapshot.inventory;
		}
		if (snapshot.items) {
			snapshot.items.forEach(function (entry) {
				bitsy.room[entry[0]].items = entry[1];
			});
		}
	}
	if (hackOptions.variables && snapshot.variables) {
		snapshot.variables.forEach(function (variable) {
			bitsy.scriptInterpreter.SetVariable(variable[0], variable[1]);
		});
	}
	if (hackOptions.dialog && snapshot.sequenceIndices) {
		bitsy.saveHack.sequenceIndices = snapshot.sequenceIndices;
	}
}

function clear() {
	localStorage.removeItem(hackOptions.key);
}

function nodeKey(node) {
	var key = node.key = node.key || node.options.map(function (option) {
		return option.Serialize();
	}).join('\n');
	return key;
}
// setup global needed for saving/loading dialog progress
bitsy.saveHack = {
	sequenceIndices: {},
	saveSeqIdx: function (node, index) {
		var key = nodeKey(node);
		bitsy.saveHack.sequenceIndices[key] = index;
	},
	loadSeqIdx: function (node) {
		var key = nodeKey(node);
		return bitsy.saveHack.sequenceIndices[key];
	}
};

// use saved index to eval/calc next index if available
inject(/(ptions\[index\].Eval)/g, `ptions[window.saveHack.loadSeqIdx(this) || index].Eval`);
inject(/var next = index \+ 1;/g, `var next = (window.saveHack.loadSeqIdx(this) || index) + 1;`);
// save index on changes
inject(/(index = next);/g, `$1,window.saveHack.saveSeqIdx(this, next);`);
inject(/(\tindex = 0);/g, `$1,window.saveHack.saveSeqIdx(this, 0);`);

// hook up autosave
var autosaveInterval;
after('onready', function () {
	if (hackOptions.autosaveInterval < Infinity) {
		clearInterval(autosaveInterval);
		autosaveInterval = setInterval(save, hackOptions.autosaveInterval);
	}
});

// hook up autoload
after('onready', function () {
	if (hackOptions.loadOnStart) {
		load();
	}
});

// hook up clear on end
after('reset_cur_game', function () {
	if (hackOptions.clearOnEnd) {
		if (bitsy.isEnding) {
			clear();
		}
	}
});

// hook up clear on start
before('startExportedGame', function () {
	if (hackOptions.clearOnStart) {
		clear();
	}
});

// hook up dialog functions
function dialogLoad(environment, parameters) {
	bitsy.reset_cur_game();
	bitsy.dialogBuffer.EndDialog();
	bitsy.startNarrating(parameters[0] || '');
}
addDualDialogTag('save', save);
addDualDialogTag('load', dialogLoad);
addDualDialogTag('clear', clear);

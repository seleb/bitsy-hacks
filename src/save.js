/**
💾
@file save
@summary save/load your game
@license MIT
@version 1.0.0
@author Sean S. LeBlanc

@description
Introduces save/load functionality.

Includes:
	- autosave option: automatically saves every X milliseconds
	- load on start option: automatically loads save on start
	- (saveNow "") dialog tag: manually saves game (parameter doesn't do anything, but is required)
	- (loadNow "") dialog tag: manually loads game (parameter is text to show as title on load)

Notes:
	- Storage is implemented through browser localStorage
	  Remember to clear storage while working on a game,
	  otherwise loading will prevent you from seeing your changes!
	- Compatability with other hacks untested

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
import bitsy from "bitsy";
import {
	after,
	addDialogTag,
} from "./helpers/kitsy-script-toolkit";
import {
	inject
} from "./helpers/utils";

var hackOptions = {
	autosaveInterval: Infinity, // time in milliseconds between autosaves (never saves if Infinity)
	loadOnStart: true, // if true, loads save when starting
	resetOnEnd: false // if true, deletes save when restarting after reaching an ending
};

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

if (hackOptions.autosaveInterval < Infinity) {
	setInterval(() => {
		save();
	}, hackOptions.autosaveInterval);
}

if (hackOptions.loadOnStart) {
	after('onready', function () {
		load();
	});
}

if (hackOptions.resetOnEnd) {
	after('reset_cur_game', function () {
		if (bitsy.isEnding) {
			localStorage.removeItem('snapshot');
		}
	});
}

function save() {
	var snapshot = {
		basic: {
			sprite: bitsy.sprite,
			room: bitsy.room,
			curRoom: bitsy.curRoom,
			variable: bitsy.variable
		},
		variableMap: Array.from(bitsy.saveHack.variableMap.entries())
			.reduce(function (result, entry) {
				result[entry[0]] = entry[1];
				return result;
			}, {}),
		sequenceIndices: bitsy.saveHack.sequenceIndices
	};
	localStorage.setItem('snapshot', JSON.stringify(snapshot));
}

function load() {
	var snapshot = localStorage.getItem('snapshot');
	// if there's no save, abort load
	if (!snapshot) {
		return;
	}

	snapshot = JSON.parse(snapshot);
	// basic props can be assigned directly
	Object.assign(bitsy, snapshot.basic);

	// variableMap needs to preserve its reference
	bitsy.saveHack.variableMap.clear();
	Object.entries(snapshot.variableMap).forEach(function (entry) {
		bitsy.saveHack.variableMap.set(entry[0], entry[1]);
	});

	// easier to assign this separately than deal with a deep-merge for basic
	bitsy.saveHack.sequenceIndices = snapshot.sequenceIndices;
}

// add dialog functions
addDialogTag('loadNow', function (environment, parameters, onReturn) {
	bitsy.stopGame();
	bitsy.clearGameData();
	bitsy.load_game(bitsy.curGameData.replace(/^(.*)$/m, parameters[0]));
	onReturn(null);
});
addDialogTag('saveNow', function (environment, parameters, onReturn) {
	save();
	onReturn(null);
});

// expose variable map
inject(/(var variableMap = new Map\(\);)/, '$1window.saveHack.variableMap = variableMap;');

// use saved index to eval/calc next index if available
inject(/(ptions\[index\].Eval)/g, `ptions[window.saveHack.loadSeqIdx(this) || index].Eval`);
inject(/var next = index \+ 1;/g, `var next = (window.saveHack.loadSeqIdx(this) || index) + 1;`);
// save index on changes
inject(/(index = next);/g, `$1,window.saveHack.saveSeqIdx(this, next);`);
inject(/(\tindex = 0);/g, `$1,window.saveHack.saveSeqIdx(this, 0);`);

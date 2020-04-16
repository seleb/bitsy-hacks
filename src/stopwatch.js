/**
⏱️
@file stopwatch
@summary time player actions
@license MIT
@version 1.2.6
@author Lenny Magner

@description
Lets you start, stop and reset a timer from dialogue and print the resulting time as part of dialogue.

Usage:
	(startWatch "timer id"): starts a timer with provided id
	(stopWatch "timer id"): stops a timer with provided id
	(resumeWatch "timer id"): resumes a timer with provided id
	(sayWatch "timer id"): prints a timer with provided id

There's also startWatchNow, stopWatchNow, and resumeWatchNow,
which do the same things, but immediately instead of when dialog ends.

Notes on edge/error cases:
	(startWatch "existing id"): overwrites existing timer
	(stopWatch "non-existent id"): does nothing
	(stopWatch "stopped id"): does nothing
	(resumeWatch "non-existent id"): starts new timer
	(resumeWatch "running id"): does nothing
	(sayWatch "non-existent id"): throws error

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Customize `timeToString` function in hackOptions below as needed
3. Add tags to your dialog as needed

NOTE: This uses parentheses "()" instead of curly braces "{}" around function
      calls because the Bitsy editor's fancy dialog window strips unrecognized
      curly-brace functions from dialog text. To keep from losing data, write
      these function calls with parentheses like the examples above.

      For full editor integration, you'd *probably* also need to paste this
      code at the end of the editor's `bitsy.js` file. Untested.
*/


import {
	addDialogTag,
	addDualDialogTag,
	before,
} from './helpers/kitsy-script-toolkit';
import {
	printDialog,
} from './helpers/utils';

export var hackOptions = {
	// function which returns the string which bitsy will print
	// parameter is a timer object with:
	//   start: value of Date.now() on startWatch
	//   end: value of Date.now() on stopWatch,
	//        or undefined if timer is running
	// current implementation is "minutes:seconds"
	timeToString: function (timer) {
		var ms = getTimeDifferenceInMs(timer);
		var time = new Date(ms);
		var mins = time.getUTCMinutes();
		var secs = time.getUTCSeconds();
		if (secs < 10) {
			secs = '0' + secs;
		}
		return mins + ':' + secs;
	},
};

function getTimeDifferenceInMs(timer) {
	return (timer.end || Date.now()) - timer.start;
}

// map of timers
var timers;

function startWatch(environment, parameters) {
	var id = parameters[0];
	timers[id] = {
		start: Date.now(),
		end: undefined,
	};
}

// note: this updates start time directly
function resumeWatch(environment, parameters) {
	var id = parameters[0];
	var timer = timers[id];

	// just start the timer if there isn't one
	if (!timer) {
		startWatch(environment, parameters);
		return;
	}

	// don't do anything if the timer's not running
	if (!timer.end) {
		return;
	}

	// resume timer
	timer.start = Date.now() - (timer.end - timer.start);
	timer.end = undefined;
}

function stopWatch(environment, parameters) {
	var id = parameters[0];
	var timer = timers[id];
	// don't do anything if there's no timer
	if (!timer) {
		return;
	}
	// don't do anything if the timer's not running
	if (timer.end) {
		return;
	}
	// end timer
	timer.end = Date.now();
}

// clear timers on game-load
before('load_game', function () {
	timers = {};
});

// add control functions
addDualDialogTag('startWatch', startWatch);
addDualDialogTag('stopWatch', stopWatch);
addDualDialogTag('resumeWatch', resumeWatch);

// add display function
addDialogTag('sayWatch', function (environment, parameters, onReturn) {
	var timer = timers[parameters[0]];
	if (!timer) {
		throw new Error('Tried to sayWatch "' + parameters[0] + '" but it was never started');
	}
	printDialog(environment, hackOptions.timeToString(timer), onReturn);
});

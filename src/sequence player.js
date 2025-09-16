/**
🎬🚪
@file sequence player
@summary creates visual countdown sequences by cycling through rooms + automatic room entry triggers
@license WTFPL
@author EZ plus his loyal companion Claude
@requires Bitsy 8.13

@description
Creates animation sequences that automatically cycle through different
rooms at timed intervals. Perfect for countdown sequences, animations, or
timed visual effects. Includes both manual triggers and automatic room-entry triggers.
Only one sequence can run at a time.

Manual Usage:
	(startSequence "room1,room2,room3" "1000" "finalRoom,8,4,fade_b" "dialogId" "2000")
	(stopSequence)

Room Trigger Usage:
	(setRoomTrigger "roomName" "room1,room2,room3" "1000" "finalRoom,8,4,fade_b" "dialogId" "2000")
	(clearRoomTrigger "roomName")
	(clearAllRoomTriggers)

Parameters:
	- rooms: comma-separated list of room names to cycle through
	- interval: time in milliseconds between room changes (1000 = 1 second)
	- finalDestination: final room to go to after sequence (optional)
	- endDialog: dialog ID to trigger after sequence completes (optional)
	- dialogDelay: delay in milliseconds before showing end dialog (optional, default: 200)
	- roomName: (for triggers) name of room that will trigger the sequence when entered

Examples:
	Manual: (startSequence "three,two,one" "1000" "boom,5,5,fade_b" "explosionDialog" "3000")
	Trigger: (setRoomTrigger "dangerZone" "warning,danger,boom" "800" "safe,10,10" "safeDialog" "1000")

HOW TO USE:
1. Create rooms for your sequences (e.g., "three", "two", "one", "boom")
2. Put countdown numbers/images as room tiles or sprites
3. Copy-paste this script after the bitsy source
4. Use manual commands in dialog OR set up room triggers
5. When player enters trigger room, sequence starts automatically
6. Only one sequence can run at a time - new sequences cancel old ones
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';

var hackOptions = {
	// Whether to clear sequence on game reset
	clearOnReset: true,
	// Whether to clear room triggers on game reset
	clearTriggersOnReset: true,
	// Whether to allow retriggering the same room sequence
	allowRetrigger: false,
	// Delay before triggering sequence after room entry (milliseconds)
	triggerDelay: 100,
};

/**
 * Helper used to replace code in a script tag based on a search regex.
 */
function inject$1(searcher, replacer) {
    var scriptTags = document.getElementsByTagName('script');
    var scriptTag;
    var code = '';
    for (var i = 0; i < scriptTags.length; ++i) {
        scriptTag = scriptTags[i];
        if (!scriptTag.textContent) continue;
        var matchesSearch = scriptTag.textContent.search(searcher) !== -1;
        var isCurrentScript = scriptTag === document.currentScript;
        if (matchesSearch && !isCurrentScript) {
            code = scriptTag.textContent;
            break;
        }
    }
    if (!code || !scriptTag) {
        throw new Error('Couldn\'t find "' + searcher + '" in script tags');
    }
    code = code.replace(searcher, replacer);
    var newScriptTag = document.createElement('script');
    newScriptTag.textContent = code;
    scriptTag.insertAdjacentElement('afterend', newScriptTag);
    scriptTag.remove();
}

function unique(array) {
    return array.filter(function (item, idx) {
        return array.indexOf(item) === idx;
    });
}

function kitsyInject(searcher, replacer) {
    if (!kitsy.queuedInjectScripts.some(function (script) {
        return searcher.toString() === script.searcher.toString() && replacer === script.replacer;
    })) {
        kitsy.queuedInjectScripts.push({
            searcher: searcher,
            replacer: replacer,
        });
    } else {
        console.warn('Ignored duplicate inject');
    }
}

function before$1(targetFuncName, beforeFn) {
    kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
    kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
}

function after$1(targetFuncName, afterFn) {
    kitsy.queuedAfterScripts[targetFuncName] = kitsy.queuedAfterScripts[targetFuncName] || [];
    kitsy.queuedAfterScripts[targetFuncName].push(afterFn);
}

function applyInjects() {
    kitsy.queuedInjectScripts.forEach(function (injectScript) {
        inject$1(injectScript.searcher, injectScript.replacer);
    });
}

function applyHooks(root) {
    var allHooks = unique(Object.keys(kitsy.queuedBeforeScripts).concat(Object.keys(kitsy.queuedAfterScripts)));
    allHooks.forEach(applyHook.bind(this, root || window));
}

function applyHook(root, functionName) {
    var functionNameSegments = functionName.split('.');
    var obj = root;
    while (functionNameSegments.length > 1) {
        obj = obj[functionNameSegments.shift()];
    }
    var lastSegment = functionNameSegments[0];
    var superFn = obj[lastSegment];
    var superFnLength = superFn ? superFn.length : 0;
    var functions = [];
    functions = functions.concat(kitsy.queuedBeforeScripts[functionName] || []);
    if (superFn) {
        functions.push(superFn);
    }
    functions = functions.concat(kitsy.queuedAfterScripts[functionName] || []);
    obj[lastSegment] = function () {
        var returnVal;
        var args = [].slice.call(arguments);
        var i = 0;
        function runBefore() {
            if (i === functions.length) {
                return returnVal;
            }
            if (arguments.length > 0) {
                args = [].slice.call(arguments);
            }
            if (functions[i].length > superFnLength) {
                return functions[i++].apply(this, args.concat(runBefore.bind(this)));
            }
            returnVal = functions[i++].apply(this, args);
            if (returnVal && returnVal.length) {
                args = returnVal;
            }
            return runBefore.apply(this, args);
        }
        return runBefore.apply(this, arguments);
    };
}

var kitsy = (window.kitsy = window.kitsy || {
    queuedInjectScripts: [],
    queuedBeforeScripts: {},
    queuedAfterScripts: {},
    inject: kitsyInject,
    before: before$1,
    after: after$1,
    applyInjects,
    applyHooks,
});

function convertDialogTags(input, tag) {
	return input.replace(new RegExp('\\\\?\\((' + tag + '(\\s+(".*?"|.+?))?)\\\\?\\)', 'g'), function (match, group) {
		if (match.substr(0, 1) === '\\') {
			return '(' + group + ')';
		}
		return '{' + group + '}';
	});
}

var hooked = kitsy.hooked;
if (!hooked) {
	kitsy.hooked = true;
	var oldStartFunc = bitsy.startExportedGame;
	bitsy.startExportedGame = function doAllInjections() {
		bitsy.startExportedGame = oldStartFunc;
		kitsy.applyInjects();
		bitsy.scriptModule = new bitsy.Script();
		bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();
		bitsy.dialogModule = new bitsy.Dialog();
		bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
		bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();
		bitsy.renderer = new bitsy.TileRenderer(bitsy.tilesize);
		bitsy.transition = new bitsy.TransitionManager();
		kitsy.applyHooks();
		bitsy.startExportedGame.apply(this, arguments);
	};
}

var inject = kitsy.inject;
var before = kitsy.before;
var after = kitsy.after;

function addDialogFunction(tag, fn) {
	kitsy.dialogFunctions = kitsy.dialogFunctions || {};
	if (kitsy.dialogFunctions[tag]) {
		console.warn('The dialog function "' + tag + '" already exists.');
		return;
	}
	before('parseWorld', function (gameData) {
		return [convertDialogTags(gameData, tag)];
	});
	kitsy.dialogFunctions[tag] = fn;
}

function injectDialogTag(tag, code) {
	inject(/(var functionMap = \{\};[^]*?)(this.HasFunction)/m, '$1\nfunctionMap["' + tag + '"] = ' + code + ';\n$2');
}

function addDialogTag(tag, fn) {
	addDialogFunction(tag, fn);
	injectDialogTag(tag, 'kitsy.dialogFunctions["' + tag + '"]');
}

function addDeferredDialogTag(tag, fn) {
	addDialogFunction(tag, fn);
	bitsy.kitsy.deferredDialogFunctions = bitsy.kitsy.deferredDialogFunctions || {};
	var deferred = (bitsy.kitsy.deferredDialogFunctions[tag] = []);
	injectDialogTag(tag, 'function(e, p, o){ kitsy.deferredDialogFunctions["' + tag + '"].push({e:e,p:p}); o(null); }');
	after('onExitDialog', function () {
		while (deferred.length) {
			var args = deferred.shift();
			bitsy.kitsy.dialogFunctions[tag](args.e, args.p, args.o);
		}
	});
	after('clearGameData', function () {
		deferred.length = 0;
	});
}

function getRoom(name) {
	var id = Object.prototype.hasOwnProperty.call(bitsy.room, name) ? name : bitsy.names.room[name];
	return bitsy.room[id];
}

function getDialog(name) {
	var id = Object.prototype.hasOwnProperty.call(bitsy.dialog, name) ? name : bitsy.names.dialog[name];
	return bitsy.dialog[id];
}

// Single sequence functionality - only one sequence can run at a time
var currentSequence = null;
var sequenceTimeout = null;

// Room trigger functionality
var roomTriggers = {};
var triggeredRooms = new Set();

function startSequence(environment, parameters) {
	var roomList = parameters[0].split(',');
	var interval = parseInt(parameters[1]) || 1000;
	var finalDestination = parameters[2] || '';
	var endDialog = parameters[3] || '';
	var dialogDelay = parseInt(parameters[4]) || 200;
	
	// Stop any existing sequence
	stopSequence();
	
	// Create new sequence object
	currentSequence = {
		rooms: roomList,
		interval: interval,
		finalDestination: finalDestination,
		endDialog: endDialog,
		dialogDelay: dialogDelay,
		currentIndex: 0,
		active: true
	};
	
	// Start the sequence
	executeSequenceStep();
}

function executeSequenceStep() {
	if (!currentSequence || !currentSequence.active) return;
	
	var currentRoom = currentSequence.rooms[currentSequence.currentIndex];
	var room = getRoom(currentRoom);
	
	if (room) {
		// Move to current room in sequence
		var p = bitsy.player();
		bitsy.movePlayerThroughExit({
			dest: {
				room: room.id,
				x: p.x,
				y: p.y,
			},
		});
	}
	
	currentSequence.currentIndex++;
	
	// Schedule next step or handle completion
	if (currentSequence.currentIndex < currentSequence.rooms.length) {
		// Continue sequence
		sequenceTimeout = setTimeout(function() {
			executeSequenceStep();
		}, currentSequence.interval);
	} else {
		// Sequence complete - handle final destination and dialog
		sequenceTimeout = setTimeout(function() {
			handleSequenceCompletion();
		}, currentSequence.interval);
	}
}

function handleSequenceCompletion() {
	if (!currentSequence) return;
	
	var finalDestination = currentSequence.finalDestination;
	var endDialog = currentSequence.endDialog;
	var dialogDelay = currentSequence.dialogDelay;
	
	// Move to final destination if specified
	if (finalDestination) {
		var params = finalDestination.split(',');
		var roomName = params[0];
		var x = params[1] || bitsy.player().x;
		var y = params[2] || bitsy.player().y;
		var transition = params[3] || '';
		
		var finalRoom = getRoom(roomName);
		if (finalRoom) {
			var exitData = {
				dest: {
					room: finalRoom.id,
					x: parseInt(x) || bitsy.player().x,
					y: parseInt(y) || bitsy.player().y,
				}
			};
			
			// Add transition effect if specified
			if (transition) {
				exitData.transition_effect = transition;
			}
			
			bitsy.movePlayerThroughExit(exitData);
		}
	}
	
	// Trigger end dialog if specified
	if (endDialog) {
		var dialog = getDialog(endDialog);
		if (dialog) {
			// Wait for the specified delay before showing dialog
			setTimeout(function() {
				bitsy.startDialog(dialog.src, dialog.id);
			}, dialogDelay);
		}
	}
	
	// Clean up sequence
	currentSequence = null;
	sequenceTimeout = null;
}

function stopSequence(environment, parameters) {
	if (currentSequence) {
		currentSequence.active = false;
		currentSequence = null;
	}
	
	if (sequenceTimeout) {
		clearTimeout(sequenceTimeout);
		sequenceTimeout = null;
	}
}

// Room trigger functions
function setRoomTrigger(environment, parameters) {
	var roomName = parameters[0];
	var rooms = parameters[1];
	var interval = parseInt(parameters[2]) || 1000;
	var finalDestination = parameters[3] || '';
	var endDialog = parameters[4] || '';
	var dialogDelay = parseInt(parameters[5]) || 200;
	
	roomTriggers[roomName] = {
		rooms: rooms,
		interval: interval,
		finalDestination: finalDestination,
		endDialog: endDialog,
		dialogDelay: dialogDelay
	};
}

function clearRoomTrigger(environment, parameters) {
	var roomName = parameters[0];
	delete roomTriggers[roomName];
	triggeredRooms.delete(roomName);
}

function clearAllRoomTriggers(environment, parameters) {
	roomTriggers = {};
	triggeredRooms.clear();
}

// Handle room entry and check for triggers
function handleRoomEntry(roomId) {
	// Find room name from ID
	var roomName = null;
	for (var name in bitsy.names.room) {
		if (bitsy.names.room[name] === roomId) {
			roomName = name;
			break;
		}
	}
	
	// If we couldn't find the name, use the ID
	if (!roomName) {
		roomName = roomId;
	}
	
	// Check if this room has a trigger set up
	if (roomTriggers[roomName]) {
		// Check if we should retrigger or if this is the first time
		var shouldTrigger = hackOptions.allowRetrigger || !triggeredRooms.has(roomName);
		
		if (shouldTrigger) {
			// Mark room as triggered (for non-retrigger mode)
			triggeredRooms.add(roomName);
			
			// Get trigger data and start sequence
			var trigger = roomTriggers[roomName];
			var sequenceParams = [
				trigger.rooms,
				trigger.interval.toString(),
				trigger.finalDestination,
				trigger.endDialog,
				trigger.dialogDelay.toString()
			];
			
			// Start the sequence using our existing startSequence function
			startSequence({}, sequenceParams);
		}
	}
}

// Hook into room transitions to detect room entry
after('movePlayerThroughExit', function(exit) {
	if (exit && exit.dest && exit.dest.room) {
		var newRoomId = exit.dest.room;
		
		// Give a brief delay to ensure room transition is complete
		setTimeout(function() {
			handleRoomEntry(newRoomId);
		}, hackOptions.triggerDelay);
	}
});

// Hook into initial room load and game reset
after('load_game', function () {
	// Clear everything if configured to do so
	if (hackOptions.clearOnReset) {
		stopSequence();
	}
	
	if (hackOptions.clearTriggersOnReset) {
		roomTriggers = {};
		triggeredRooms.clear();
	}
	
	// Check current room for triggers after load
	setTimeout(function() {
		if (bitsy.state.room) {
			handleRoomEntry(bitsy.state.room);
		}
	}, hackOptions.triggerDelay);
});

// Add dialog functions - Manual sequence control
addDeferredDialogTag('startSequence', startSequence);
addDeferredDialogTag('stopSequence', stopSequence);

// Immediate versions
addDialogTag('startSequenceNow', function (environment, parameters, onReturn) {
	startSequence(environment, parameters);
	onReturn(null);
});

addDialogTag('stopSequenceNow', function (environment, parameters, onReturn) {
	stopSequence(environment, parameters);
	onReturn(null);
});

// Room trigger dialog functions
addDialogTag('setRoomTrigger', function (environment, parameters, onReturn) {
	setRoomTrigger(environment, parameters);
	onReturn(null);
});

addDialogTag('clearRoomTrigger', function (environment, parameters, onReturn) {
	clearRoomTrigger(environment, parameters);
	onReturn(null);
});

addDialogTag('clearAllRoomTriggers', function (environment, parameters, onReturn) {
	clearAllRoomTriggers(environment, parameters);
	onReturn(null);
});

// Expose for debugging
exports.currentSequence = currentSequence;
exports.roomTriggers = roomTriggers;
exports.triggeredRooms = triggeredRooms;
exports.hackOptions = hackOptions;

})(this.hacks.visualCountdown = this.hacks.visualCountdown || {}, window);
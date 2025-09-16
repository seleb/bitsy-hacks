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
import bitsy from 'bitsy';
import { addDeferredDialogTag, addDialogTag, after } from './helpers/kitsy-script-toolkit';
import { getDialog, getRoom } from './helpers/utils';

export var hackOptions = {
	// Whether to clear sequence on game reset
	clearOnReset: true,
	// Whether to clear room triggers on game reset
	clearTriggersOnReset: true,
	// Whether to allow retriggering the same room sequence
	allowRetrigger: false,
	// Delay before triggering sequence after room entry (milliseconds)
	triggerDelay: 100,
};

// Single sequence functionality - only one sequence can run at a time
export var currentSequence = null;
export var sequenceTimeout = null;

// Room trigger functionality
export var roomTriggers = {};
export var triggeredRooms = new Set();

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

/**
💱
@file twine bitsy comms
@summary interprocess communication for twine and bitsy
@license MIT
@version 1.0.0
@requires 5.4
@author Sean S. LeBlanc

@description
Provides a method of easily integrating bitsy games into twine games.
Variables are automatically shared between the two engines,
and dialog commands are provided which allow basic twine commands
to be executed from inside of a bitsy game.

Note that twine has multiple story formats which function in different ways,
and this hack requires integration code on both engines to work properly.
It's likely possible to integrate against any of the common story formats,
but currently only a single integration is provided:
	SugarCube v2 macro: https://github.com/seleb/bitsy-hacks/blob/master/src/twine-bitsy-comms/SugarCube-v2.js

Dialog command list:
	(twinePlay "<twine passage title>")
	(twinePlayNow "<twine passage title>")
	(twineBack)
	(twineBackNow)
	(twineEval "<javascript directly evaluated in macro context>")
	(twineEvalNow "<javascript directly evaluated in macro context>")

Note that eval support is commented out by default twine integration.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Copy-paste the twine script into the Story JavaScript section of your twine game
(optional)
3. Add `.bitsy { ... }` CSS to the Story Stylesheet of your twine game
4. Edit the variable naming functions below as needed
   (shared variables have prefixed names by default to avoid accidental overwriting)
*/
import bitsy from "bitsy";
import {
	addDialogTag,
	addDeferredDialogTag,
	after
} from "./helpers/kitsy-script-toolkit";

var hackOptions = {
	// how dialog variables will be named when they are sent out
	// default implementation is bitsy_<name>
	variableNameOut: function(name) {
		return 'bitsy_' + name;
	},
	// how item variables will be named when they are sent out
	// default implementation is bitsy_item_<name or id>
	// Note: items names in bitsy don't have to be unique,
	// so be careful of items overwriting each other if you use this!
	itemNameOut: function(id) {
		return 'bitsy_item_' + (bitsy.item[id].name || id);
	},
	// how dialog variables will be named when they are sent in
	// default implementation is twine_<name>
	variableNameIn: function(name) {
		return 'twine_' + name;
	},

	// the options below are for customizing the integration;
	// if you're using the provided macro, you can safely ignore them

	// how info will be posted to external process
	// default implementation is for iframe postMessage-ing to parent page
	send: function(type, data) {
		window.parent.postMessage({ type: type, data: data }, '*');
	},
	// how info will be received from external process
	// default implementation is for parent page postMessage-ing into iframe
	receive: function() {
		window.addEventListener("message", function (event) {
			var type = event.data.type;
			var data = event.data.data;
			receiveMessage(type, data);
		}, false);
	},
};

// hook up incoming listener
hackOptions.receive();
function receiveMessage(type, data) {
	switch (type) {
		case 'variables':
			Object.entries(data).forEach(function (entry) {
				var name = entry[0];
				var value = entry[1];
				bitsy.scriptInterpreter.SetVariable(hackOptions.variableNameIn(name), value);
			});
			break;
		default:
			console.warn('Unhandled message from outside Bitsy:', type, data);
			break;
	}
}

// hook up outgoing var/item change listeners
function sendVariable(name, value) {
	hackOptions.send('variable', { name: name, value: value });
}
after('onVariableChanged', function(name) {
	sendVariable(hackOptions.variableNameOut(name), bitsy.scriptInterpreter.GetVariable(name));
});
after('onInventoryChanged', function(id) {
	sendVariable(hackOptions.itemNameOut(id), bitsy.player().inventory[id]);
});

// say when bitsy has started
// and initialize variables
after('startExportedGame', function() {
	bitsy.scriptInterpreter.GetVariableNames().forEach(function(name) {
		sendVariable(hackOptions.variableNameOut(name), bitsy.scriptInterpreter.GetVariable(name));
	});
	Object.values(bitsy.item).forEach(function(item) {
		sendVariable(hackOptions.itemNameOut(item.id), 0);
	});
	hackOptions.send('start', bitsy.title);
});

// hook up dialog commands
[
	'eval',
	'play',
	'back'
].forEach(function(command){
	function doCommand(environment, parameters, onReturn) {
		hackOptions.send(command, parameters[0]);
		if (onReturn) {
			onReturn(null);
		}
	}
	addDeferredDialogTag('twine'+command.substr(0,1).toUpperCase()+command.substr(1), doCommand);
	addDialogTag('twine'+command.substr(0,1).toUpperCase()+command.substr(1)+'Now', doCommand);
});

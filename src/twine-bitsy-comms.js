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
after('startExportedGame', function() {
	hackOptions.send('start', bitsy.title);
});

// hook up dialog commands
[
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

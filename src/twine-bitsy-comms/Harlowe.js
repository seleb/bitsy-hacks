/**
@summary twine-bitsy-comms Harlowe script
@license MIT
@version 1.0.1
@author Sean S. LeBlanc

@description
example (inside of script tag): window.bitsy('./my bitsy.html');

the bitsy game will render as an iframe with the class "bitsy"
inside of the passage that includes it;
you can use this to customize its CSS
(e.g. `border: none;`, `image-rendering: pixelated;`)
*/
var sendMessage;

// setup listeners
function handleBitsyMessage(event) {
	var type = event.data.type;
	var data = event.data.data;
	switch (type) {
		case 'start':
			var variables = {};
			Object.entries(State.variables).forEach(function (entry) {
				if (!entry[0].startsWith('TwineScript_')) {
					variables[entry[0]] = entry[1];
				}
			});
			sendMessage({
				type: 'variables',
				data: variables,
			});
			break;
		case 'play':
			Engine.goToPassage(data);
			break;
		case 'back':
			Engine.goBack();
			break;
		case 'variable':
			State.variables[data.name] = data.value;
			break;
		case 'eval':
			console.warn('The "eval" command is commented out by default since it\'s easy to abuse. Uncomment it in your javascript if you want to use it.');
			// eval(data);
			break;
		default:
			console.warn('Unhandled message from Bitsy:', type, data);
			break;
	}
}
window.addEventListener('message', handleBitsyMessage, false);
window.bitsy = function (src) {
	// setup iframe
	var iframe = document.createElement('iframe');
	iframe.width = 512;
	iframe.height = 512;
	iframe.src = src;
	iframe.className = 'bitsy';

	sendMessage = function (message) {
		iframe.contentWindow.postMessage(message, '*');
	};

	// make sure the iframe keeps focus
	// so that bitsy can capture key events
	setTimeout(function () {
		iframe.focus();
		iframe.onblur = function () {
			iframe.focus();
		};
	});

	// output
	document.querySelector(Selectors.passage).appendChild(iframe);
};

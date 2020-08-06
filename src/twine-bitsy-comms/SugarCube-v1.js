/**
@summary twine-bitsy-comms SugarCube v1 Macro
@license MIT
@version 1.0.0
@author Sean S. LeBlanc

@description
example: <<bitsy>>./my bitsy.html<</bitsy>>

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
		sendMessage({
			type: 'variables',
			data: state.active.variables,
		});
		break;
	case 'play':
		state.display(data);
		break;
	case 'back':
		Engine.goBack();
		break;
	case 'variable':
		state.active.variables[data.name] = data.value;
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
macros.add('bitsy', {
	tags: null,
	handler: function () {
		// setup iframe
		var iframe = document.createElement('iframe');
		iframe.width = 512;
		iframe.height = 512;
		iframe.src = this.payload[0].contents;
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
		this.output.appendChild(iframe);
	},
});

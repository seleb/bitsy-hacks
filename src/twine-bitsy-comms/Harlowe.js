var sendMessage;

// setup listeners
function handleBitsyMessage(event) {
	var type = event.data.type;
	var data = event.data.data;
	switch (type) {
		case 'start':
			sendMessage({
				type: 'variables',
				data: State.variables.__proto__, // hmm
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
window.addEventListener("message", handleBitsyMessage, false);
window.bitsy = function (src) {
	// setup iframe
	var iframe = document.createElement('iframe');
	iframe.width = 512;
	iframe.height = 512;
	iframe.src = src;
	iframe.className = 'bitsy';

	sendMessage = function(message) {
		iframe.contentWindow.postMessage(message, '*');
	}

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
}

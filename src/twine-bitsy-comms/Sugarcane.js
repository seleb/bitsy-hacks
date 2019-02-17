/**
@summary twine-bitsy-comms Sugarcane macro
@license MIT
@version 1.0.0
@author Sean S. LeBlanc

@description
example: <<bitsy "./my bitsy.html">>

the bitsy game will render as an iframe with the class "bitsy"
inside of the passage that includes it;
you can use this to customize its CSS
(e.g. `border: none;`, `image-rendering: pixelated;`)
*/
macros.bitsy = {
	handler: function () {
		// setup iframe
		var iframe = document.createElement('iframe');
		iframe.width = 512;
		iframe.height = 512;
		iframe.src = arguments[2];
		iframe.className = 'bitsy';

		// setup listeners
		function handleBitsyMessage(event) {
			var type = event.data.type;
			var data = event.data.data;
			switch (type) {
				case 'start':
					iframe.contentWindow.postMessage({
						type: 'variables',
						data: state.history[0].variables,
					}, '*');
					break;
				case 'play':
					state.display(data);
					break;
				case 'back':
					window.history.back();
					break;
				case 'variable':
					state.history[0].variables[data.name] = data.value;
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
		prerender.bitsy = function () {
			window.removeEventListener("message", handleBitsyMessage, false);
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
		arguments[3].output.appendChild(iframe);
	}
};

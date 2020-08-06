/**
@summary twine-bitsy-comms Snowman
@license MIT
@version 1.0.0
@author Sean S.LeBlanc

@description
example: <% story.bitsy('./ my bitsy.html') %>

the bitsy game will render as an iframe with the class "bitsy"
inside of the passage that includes it;
you can use this to customize its CSS
(e.g. `border: none;`, `image-rendering: pixelated;`)
*/
story.bitsy = function (src) {
	// setup iframe
	var iframe = document.createElement('iframe');
	iframe.width = 512;
	iframe.height = 512;
	iframe.src = src;
	iframe.className = 'bitsy';

	// setup listeners
	function handleBitsyMessage(event) {
		var type = event.data.type;
		var data = event.data.data;
		switch (type) {
			case 'start':
				iframe.contentWindow.postMessage({
					type: 'variables',
					data: story.state,
				}, '*');
				break;
			case 'play':
				story.show(data);
				break;
			case 'back':
				window.history.back();
				break;
			case 'variable':
				story.state[data.name] = data.value;
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
	$(document).one('showpassage', function () {
		window.removeEventListener("message", handleBitsyMessage, false);
	});

	$(window).one('showpassage:after', function () {
		document.getElementById('passage').appendChild(iframe);
		// make sure the iframe keeps focus
		// so that bitsy can capture key events
		setTimeout(function () {
			iframe.focus();
			iframe.onblur = function () {
				iframe.focus();
			};
		});
	});
};

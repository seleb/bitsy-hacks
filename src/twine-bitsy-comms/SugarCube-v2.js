Macro.add('bitsy', {
	tags: null,
	handler: function () {
		// setup iframe
		var iframe = document.createElement('iframe');
		iframe.width = 512;
		iframe.height = 512;
		iframe.src = this.payload[0].contents;
		iframe.className = 'bitsy';

		// setup listeners
		function handleBitsyMessage(event) {
			var type = event.data.type;
			var data = event.data.data;
			switch (type) {
				case 'start':
					iframe.contentWindow.postMessage({
						type: 'variables',
						data: State.variables,
					}, '*');
					break;
				case 'play':
					Engine.play(data);
					break;
				case 'back':
					Engine.backward();
					break;
				case 'variable':
					State.variables[data.name] = data.value;
					break;
				default:
					console.warn('Unhandled message from Bitsy:', type, data);
					break;
			}
		}
		window.addEventListener("message", handleBitsyMessage, false);
		$(document).one(':passagestart', function () {
			window.removeEventListener("message", handleBitsyMessage, false);
		});

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
	}
});

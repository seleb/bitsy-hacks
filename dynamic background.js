/*
bitsy hack - dynamic background

Updates the background of the html body to match the background colour of the bitsy palette.

HOW TO USE:
Copy-paste this script into a script tag after the bitsy source
*/
(function () {
	// helper function which detects when the palette has changed,
	// and updates the background to match
	var _palWrap = function (f) {
		// get the original function
		var _f = window[f];

		// create the wrapper function
		window[f] = function () {
			var p1, p2;

			// get current palette
			try {
				p1 = curPal();
			} catch (e) {
				p1 = null;
			}

			if (_f) {
				// call the original function
				_f.apply(undefined, arguments);

				// get the new palette
				p2 = curPal();

				// if the palette changed, update background
				if (p1 !== p2) {
					document.body.style.background = "rgb(" + palette[curPal()].colors[0].toString() + ")";
				}
			}
		};
	};

	// wrap every function which involves changing the palette
	_palWrap('moveSprites');
	_palWrap('movePlayer');
	_palWrap('parseWorld');
}());
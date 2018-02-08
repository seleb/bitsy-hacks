/*
bitsy hack - custom font exporter

Extracts bitsy's font into an image template.
The generated template lays out letters in a 16x16 grid, with each letter separated by one red pixel of padding.

Font data in bitsy is stored in a big 1-bit array called `fontdata`.
Individual letters are 6x8 slices of the array in stored according to ascii order.
e.g. the letter "A" is 65th, and looks like:

	0,0,1,1,1,0,
	0,1,0,0,0,1,
	0,1,0,0,0,1,
	0,1,0,0,0,1,
	0,1,1,1,1,1,
	0,1,0,0,0,1,
	0,1,0,0,0,1,
	0,0,0,0,0,0,

HOW TO USE
1. Copy-paste into a script tag after the bitsy source
2. Run game
3. Right click on image, and select "Save image as..."
*/
(function () {
	///////////
	// setup //
	///////////
	var fontsize = {
		x: 5,
		y: 8
	}; // bitsy font size
	var characters = {
		x: 16,
		y: 16
	}; // x * y must equal 256
	var padding = 1;

	// canvas context
	var canvas = document.createElement('canvas');
	canvas.width = (fontsize.x + padding) * characters.x + padding;
	canvas.height = (fontsize.y + padding) * characters.y + padding;
	var ctx = canvas.getContext('2d');

	// helper used to expose getter for private vars
	var expose = function (target) {
		var code = target.toString();
		code = code.substring(0, code.lastIndexOf("}"));
		code += "this.get = function(name) {return eval(name);};";
		return eval("[" + code + "}]")[0];
	};

	//////////////
	// exporter //
	//////////////
	var chars = [];
	var fontdata = (new(expose(Font))()).get('fontdata'); // get the fontdata

	// convert from single array to character slices
	for (var i = 0; i < fontdata.length; i += fontsize.x * fontsize.y) {
		var char = fontdata.slice(i, i + fontsize.x * fontsize.y);
		chars.push(char);
	}
	// convert from 1-bit to pixels
	for (var i = 0; i < chars.length; ++i) {
		var char = chars[i];
		var data = ctx.createImageData(fontsize.x, fontsize.y);
		for (var y = 0; y < fontsize.y; ++y) {
			for (var x = 0; x < fontsize.x; ++x) {
				var idx = (y * fontsize.x + x) * 4;
				data.data[idx + 0] = char[y * fontsize.x + x] * 255;
				data.data[idx + 1] = char[y * fontsize.x + x] * 255;
				data.data[idx + 2] = char[y * fontsize.x + x] * 255;
				data.data[idx + 3] = 255;
			}
		}
		chars[i] = data;
	}

	// convert from pixels to canvas
	// padding
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	// letters
	for (var i = 0; i < chars.length; ++i) {
		ctx.putImageData(chars[i], i % characters.x * (fontsize.x + padding) + padding, Math.floor(i / characters.x) * (fontsize.y + padding) + padding);
	}

	// convert from canvas to image
	var fontTemplate = new Image();
	fontTemplate.src = canvas.toDataURL();

	// replace bitsy startup with just displaying the font template
	startExportedGame = function () {
		// remove existing page content
		while (document.body.childNodes.length > 0) {
			document.body.childNodes[0].remove();
		}
		// add font template
		document.body.appendChild(fontTemplate);
	};
}());
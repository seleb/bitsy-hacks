/*
bitsy hack - transparent sprites

Makes all sprites have transparent backgrounds.
i.e. tiles can be seen underneath the player, sprites, and items.

HOW TO USE:
Copy-paste this script into a script tag after the bitsy source
*/
(function () {
	// give ourselves a little canvas + context to work with
	var spriteCanvas = document.createElement("canvas");
	spriteCanvas.width = tilesize * scale;
	spriteCanvas.height = tilesize * scale;
	var spriteContext = spriteCanvas.getContext("2d");

	// override imageDataFromImageSource to use transparency for background pixels
	// and save the results to a custom image cache
	var _imageDataFromImageSource = imageDataFromImageSource;
	imageDataFromImageSource = function (imageSource, pal, col) {
		// get the bitsy image data
		var img = _imageDataFromImageSource.apply(undefined, arguments);

		// make background pixels transparent
		var bg = getPal(pal)[0];
		for (var i = 0; i < img.data.length; i += 4) {
			if (
				img.data[i + 0] === bg[0],
				img.data[i + 1] === bg[1],
				img.data[i + 2] === bg[2]
			) {
				img.data[i + 3] = 0;
			}
		}

		// put bitsy data to our canvas
		spriteContext.clearRect(0, 0, tilesize * scale, tilesize * scale);
		spriteContext.putImageData(img, 0, 0);

		// create a new image from the data and save it in our cache
		img = new Image();
		img.src = spriteCanvas.toDataURL("image/png");

		// return our image	
		return img;
	}

	var getImage = function (data) {
		return img;
	};

	// override drawTile to draw from our custom image cache
	// instead of putting image data directly
	var _drawTile = drawTile;
	drawTile = function (img, x, y, context) {
		if (!context) { //optional pass in context; otherwise, use default
			context = ctx;
		}

		context.drawImage(img, x * tilesize * scale, y * tilesize * scale);
	};
}());

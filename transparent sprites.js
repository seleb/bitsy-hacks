/*
bitsy hack - transparent sprites

Makes all sprites have transparent backgrounds.
i.e. tiles can be seen underneath the player, sprites, and items.

HOW TO USE:
Copy-paste this script into a script tag after the bitsy source
*/
(function () {
	// if true, overrides scaling behaviour to reduce the setup time + memory use,
	// but the game will be blurry unless you've added pixelated image CSS
	var scaling = false;

	// give ourselves a little canvas + context to work with
	var spriteCanvas = document.createElement("canvas");
	spriteCanvas.width = tilesize * (scaling ? 1 : scale);
	spriteCanvas.height = tilesize * (scaling ? 1 : scale);
	var spriteContext = spriteCanvas.getContext("2d");

	// override imageDataFromImageSource to use transparency for background pixels
	// since this is much slower than just using the pixels directly,
	// a getter with an internal cache is returned to delay image creation
	// until first use
	var _imageDataFromImageSource = imageDataFromImageSource;
	imageDataFromImageSource = function (imageSource, pal, col) {
		var args = arguments;
		var img;
		return function () {
			if (img) {
				// return cached image
				return img;
			}
			// get the bitsy image data
			img = _imageDataFromImageSource.apply(undefined, args);

			// make background pixels transparent
			var bg = getPal(pal)[0];

			// discard unnecessary pixels
			if (scaling) {
				for (var i = 0; i < img.data.length / scale; i += 4) {
					img.data[i + 0] = img.data[i * scale + 0];
					img.data[i + 1] = img.data[i * scale + 1];
					img.data[i + 2] = img.data[i * scale + 2];
					img.data[i + 3] = img.data[i * scale + 3];
				}
				img.data.length = img.data.length / 4;
			}

			// set background pixels to transparent
			for (var i = 0; i < img.data.length; i += 4) {
				if (
					img.data[i + 0] === bg[0] &&
					img.data[i + 1] === bg[1] &&
					img.data[i + 2] === bg[2]
				) {
					img.data[i + 3] = 0;
				}
			}

			// put bitsy data to our canvas
			spriteContext.clearRect(0, 0, tilesize, tilesize);
			if (scaling) {
				spriteContext.putImageData(img, 0, 0, 0, 0, tilesize, tilesize);
			} else {
				spriteContext.putImageData(img, 0, 0);
			}

			// create a new image from the data and save it in our cache
			img = new Image();
			img.src = spriteCanvas.toDataURL("image/png");

			// return our image	
			return img;
		}
	}

	// override drawTile to draw from our custom image cache
	// instead of putting image data directly
	var _drawTile = drawTile;
	drawTile = function (img, x, y, context) {
		if (!context) { //optional pass in context; otherwise, use default
			context = ctx;
		}

		if (scaling) {
			context.drawImage(img(), x * tilesize * scale, y * tilesize * scale, tilesize * scale, tilesize * scale);
		} else {
			context.drawImage(img(), x * tilesize * scale, y * tilesize * scale);
		}
	};
}());
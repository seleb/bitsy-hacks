/*
bitsy hack - transparent sprites

Makes all sprites have transparent backgrounds.
i.e. tiles can be seen underneath the player, sprites, and items.

HOW TO USE:
Copy-paste this script into a script tag after the bitsy source
*/
// if true, overrides scaling behaviour to reduce the setup time + memory use,
// but the game will be blurry unless you've added pixelated image CSS
var scaling = false;

// override imageDataFromImageSource to use transparency for background pixels
// and save the results to a custom image cache
var _imageDataFromImageSource = imageDataFromImageSource;
imageDataFromImageSource = function (imageSource, pal, col) {
	var cache;
	return function (args) {
		if (cache) {
			return cache;
		}

		// get the bitsy image data
		var img = _imageDataFromImageSource.apply(undefined, args);

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

		// give ourselves a little canvas + context to work with
		var spriteCanvas = document.createElement("canvas");
		spriteCanvas.width = tilesize * (scaling ? 1 : scale);
		spriteCanvas.height = tilesize * (scaling ? 1 : scale);
		var spriteContext = spriteCanvas.getContext("2d");

		// put bitsy data to our canvas
		spriteContext.clearRect(0, 0, tilesize, tilesize);
		if (scaling) {
			spriteContext.putImageData(img, 0, 0, 0, 0, tilesize, tilesize);
		} else {
			spriteContext.putImageData(img, 0, 0);
		}

		// save it in our cache
		cache = spriteCanvas;

		// return our image	
		return cache;
	}.bind(undefined, arguments)
};

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
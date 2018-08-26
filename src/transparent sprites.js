/**
🏁
@file transparent sprites
@summary makes all sprites have transparent backgrounds
@license MIT
@version 2.0.2
@requires Bitsy Version: 5.1
@author Sean S. LeBlanc

@description
Makes all sprites have transparent backgrounds.
i.e. tiles can be seen underneath the player, sprites, and items.

HOW TO USE:
Copy-paste this script into a script tag after the bitsy source
*/
import bitsy from "bitsy";
import {
	inject
} from "./helpers/kitsy-script-toolkit";

// override imageDataFromImageSource to use transparency for background pixels
// and save the results to a custom image cache
inject(/(function imageDataFromImageSource\(imageSource, pal, col\) {)([^]*?)return img;/, [
'$1',
'	var cache;',
'	return function(){',
'		if (cache) {',
'			return cache;',
'		}',
'		$2',
'		// make background pixels transparent',
'		var bg = getPal(pal)[0];',
'		var i;',
'		// set background pixels to transparent',
'		for (i = 0; i < img.data.length; i += 4) {',
'			if (',
'				img.data[i + 0] === bg[0] &&',
'				img.data[i + 1] === bg[1] &&',
'				img.data[i + 2] === bg[2]',
'			) {',
'				img.data[i + 3] = 0;',
'			}',
'		}',
'	',
'		// give ourselves a little canvas + context to work with',
'		var spriteCanvas = document.createElement("canvas");',
'		spriteCanvas.width = tilesize * (scale);',
'		spriteCanvas.height = tilesize * (scale);',
'		var spriteContext = spriteCanvas.getContext("2d");',
'	',
'		// put bitsy data to our canvas',
'		spriteContext.clearRect(0, 0, tilesize, tilesize);',
'		spriteContext.putImageData(img, 0, 0);',
'	',
'		// save it in our cache',
'		cache = spriteCanvas;',
'	',
'		// return our image	',
'		return cache;',
'	};',
].join('\n'));

// override drawTile to draw from our custom image cache
// instead of putting image data directly
inject(/(function drawTile\(img,x,y,context\) {)/, [
'$1',
'	if (!context) { //optional pass in context; otherwise, use default',
'		context = ctx;',
'	}',
'',
'	context.drawImage(',
'		img(),',
'		x * tilesize * scale,',
'		y * tilesize * scale',
'	);',
'	return;',
].join('\n'));

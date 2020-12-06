/**
🕷
@file itsy-bitsy
@summary for when bitsy's not small enough
@license MIT
@version auto
@requires 8.0
@author Sean S. LeBlanc

@description
Modifies bitsy to run at 64x64 pixels instead of 256x256.

Note that this means you have significantly less space for text
(text in regular bitsy is twice as large as the rest of the game)

HOW TO USE:
	1. Copy-paste this script into a new script tag after the Bitsy source code.
*/
import {
	inject,
} from './helpers/kitsy-script-toolkit';

// rewrite main canvas width/height
inject(/(width =) 128/, '$1 64');
inject(/(height =) 128/, '$1 64');

inject(/(scale = )4/, '$1 1'); // rewrite canvas scale
inject(/(text_scale = )scale \/ 2/, '$1 1'); // rewrite text scale
inject(/(roomsize =) 16/, '$1 8'); // rewrite roomsize
inject(/(< )16/g, '$1 (roomsize-1)'); // rewrite boundary checks

// rewrite textbox info
inject(/(var textboxInfo = {)[^]*?(};)/, '$1' + [
	'textureId : null',
	'width : 62',
	'height : 64',
	'top : 1',
	'left : 1',
	'bottom : 1',
	'padding_vert : 1',
	'padding_horz : 1',
	'arrow_height : 6',
].join(',\n') + '$2');

inject(/\(4 \* textToRoomScaleRatio\)/g, '1');
inject(/(pixelsPerRow =) .*;/, '$1 62;'); // rewrite hard-coded textbox wrap width

// inject pixelated rendering style
var style = document.createElement('style');
style.innerText = '#game{ -ms-interpolation-mode: nearest-neighbor;image-rendering: -webkit-optimize-contrast;image-rendering: -moz-crisp-edges;image-rendering: -o-pixelated;image-rendering: pixelated; }';
document.head.appendChild(style);

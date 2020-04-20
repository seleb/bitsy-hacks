/**
🕷
@file itsy-bitsy
@summary for when bitsy's not small enough
@license MIT
@version 1.1.5
@requires Bitsy Version: 5.1
@author Sean S. LeBlanc

@description
Modifies bitsy to run at 64x64 pixels instead of 256x256.

Note that this means you have significantly less space for text
(text in regular bitsy is twice as large as the rest of the game)
To help deal with this, a hack option is provided which lets you
customize how many rows of text the dialog boxes will show.

HOW TO USE:
	1. Copy-paste this script into a new script tag after the Bitsy source code.
	2. edit hackOptions below as needed

NOTE:
The number of rows is the only provided hack option,
but most of the numbers being replaced can be easily
customized if you want slightly different sizes/positions.
*/
import {
	inject,
} from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	rows: 2, // number of rows per text box (bitsy default is 2)
};

// rewrite main canvas width/height
inject(/(width =) 128/, '$1 64');
inject(/(height =) 128/, '$1 64');

inject(/4(; \/\/this is stupid but necessary)/, '1$1'); // rewrite canvas scale
inject(/(mapsize =) 16/, '$1 8'); // rewrite mapsize
inject(/(\+ 1 >=) 16/g, '$1 8'); // rewrite right/down wall checks

inject(/2(; \/\/using a different scaling factor for text feels like cheating\.\.\. but it looks better)/, '1$1'); // rewrite text scale

// rewrite textbox info
inject(/(var textboxInfo = {)[^]*?(};)/, '$1' + [
	'img : null,',
	'width : 62,',
	'height : 64,',
	'top : 1,',
	'left : 1,',
	'bottom : 1,',
	'font_scale : 1,',
	'padding_vert : 2,',
	'arrow_height : 5',
].join('\n') + '$2');
inject(/(top = \()4/, '$1 1');
inject(/(left = \()4/, '$1 1');

inject(/(relativeFontHeight\(\) \*) 2/, '$1 ' + hackOptions.rows); // rewrite textbox height
inject(/(pixelsPerRow =) 192/, '$1 62'); // rewrite hard-coded textbox wrap width
inject(/(else if \(curRowIndex )== 0/g, '$1< ' + (hackOptions.rows - 1)); // rewrite hard-coded row limit

// inject pixelated rendering style
var style = document.createElement('style');
style.innerText = '#game{ -ms-interpolation-mode: nearest-neighbor;image-rendering: -webkit-optimize-contrast;image-rendering: -moz-crisp-edges;image-rendering: -o-pixelated;image-rendering: pixelated; }';
document.head.appendChild(style);

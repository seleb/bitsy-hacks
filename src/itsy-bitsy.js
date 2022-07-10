/**
🕷
@file itsy-bitsy
@summary for when bitsy's not small enough
@license MIT
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
import bitsy from 'bitsy';
import { after, before, inject } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	rows: 2, // number of rows per text box (bitsy default is 2)
};

before('startExportedGame', function () {
	bitsy.scale = 1;
	bitsy.textScale = 1;
	bitsy.mapsize = 8;
	bitsy.width = bitsy.mapsize * bitsy.tilesize;
	bitsy.height = bitsy.mapsize * bitsy.tilesize;
	bitsy.bitsy.MAP_SIZE = bitsy.mapsize;
	bitsy.bitsy.VIDEO_SIZE = bitsy.width;
	// eslint-disable-next-line no-underscore-dangle
	bitsy.bitsy._graphics.setScale(1);
});
after('bitsy.textMode', function () {
	return bitsy.bitsy.TXT_LOREZ;
});

// rewrite textbox info
inject(/(var textboxInfo = {)[^]*?(};)/, '$1 width : 62, height : 64, top : 1, left : 1, bottom : 1, padding_vert : 2, padding_horz : 0, arrow_height : 6 $2');
inject(/(top = \()4/g, '$1 1');
inject(/(left = \()4/g, '$1 1');

inject(/(relativeFontHeight\(\) \*) 2/, '$1 ' + hackOptions.rows); // rewrite textbox height
inject(/(else if \(curRowIndex )== 0/g, '$1< ' + (hackOptions.rows - 1)); // rewrite hard-coded row limit

// inject pixelated rendering style
var style = document.createElement('style');
style.innerText =
	'#game{ -ms-interpolation-mode: nearest-neighbor;image-rendering: -webkit-optimize-contrast;image-rendering: -moz-crisp-edges;image-rendering: -o-pixelated;image-rendering: pixelated; }';
document.head.appendChild(style);

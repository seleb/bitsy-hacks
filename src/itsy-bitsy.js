/**
🕷
@file itsy-bitsy
@summary for when bitsy's not small enough
@license MIT
@version 1.0.0
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
*/
import {
	inject
} from "./helpers/kitsy-script-toolkit";

var hackOptions = {
	rows: 2, // number of rows per text box (bitsy default is 2)
};

// rewrite main canvas width/height
inject(/(width =) 128/, '$1 64');
inject(/(height =) 128/, '$1 64');

inject(/4(; \/\/this is stupid but necessary)/, '1$1'); // rewrite canvas scale
inject(/(mapsize =) 16/, '$1 8'); // rewrite mapsize
inject(/2(; \/\/using a different scaling factor for text feels like cheating\.\.\. but it looks better)/, '1$1'); // rewrite text scale

// rewrite textbox info
inject(/(var textboxInfo = {)[^]*?(};)/, '$1' + [
	'img : null,',
	'width : 64,',
	'height : 64,',
	'top : 0,',
	'left : 0,',
	'bottom : 0,',
	'font_scale : 1,',
	'padding_vert : 1,',
	'padding_horz : 0,',
	'arrow_height : 10'
].join('\n') + '$2');
inject(/(top = \()4/, '$1 1');
inject(/(left = \()4/, '$1 1');

inject(/(relativeFontHeight\(\) \*) 2/, '$1 ' + hackOptions.rows); // rewrite textbox height
inject(/(pixelsPerRow =) 192/, '$1 64'); // rewrite hard-coded textbox wrap width
inject(/(else if \(curRowIndex )== 0/g, '$1< ' + (hackOptions.rows - 1)); // rewrite hard-coded row limit

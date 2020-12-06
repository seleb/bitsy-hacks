/**
📜
@file long dialog
@summary put more words onscreen
@license MIT
@version auto
@requires 8.0
@author Sean S. LeBlanc

@description
Makes the dialog box variable in height, allowing it to expand as needed.

Minimum and maximum size are configurable.
Cheat sheet:
	2: bitsy default
	8: reaches just below the halfway mark
	16: roughly the max of the original bitsy margins
	19: max before cutting off text

Note: this hack also includes the paragraph break hack
A common pattern in bitsy is using intentional whitespace to force new dialog pages,
but the long dialog hack makes that look awkward since the text box expands.
You can use a {PG} tag (page break) to end the current page without changing the size.

HOW TO USE:
	1. Copy-paste this script into a new script tag after the Bitsy source code.
	2. edit hackOptions below as needed
*/
import { inject } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	minRows: 2,
	maxRows: 4,
};

// override textbox height
inject(
	/textboxInfo\.height = .+;/,
	`Object.defineProperty(textboxInfo, 'height', {
	get() { return textboxInfo.padding_vert + (textboxInfo.padding_vert + relativeFontHeight()) * Math.min(${hackOptions.maxRows}, Math.max(${hackOptions.minRows}, textboxInfo.rows || 0)) + textboxInfo.arrow_height; }
})`,
);
inject(
	/buffer\.ForEachActiveChar\(this\.DrawChar\)/,
	'textboxInfo.rows = 0;\nbuffer.ForEachActiveChar(function(char, row, col, leftPos) { textboxInfo.rows = row + 1; dialogRenderer.DrawChar.apply(dialogRenderer, arguments); });',
);
// prevent textbox from caching
inject(/(textboxInfo.textureId )== null/, '$1 !== -1');
// rewrite hard-coded row limit
inject(/(var maxRowCount = )2/, '$1 ' + hackOptions.maxRows); // rewrite hard-coded row limit

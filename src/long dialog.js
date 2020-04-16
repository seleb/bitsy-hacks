/**
📜
@file long dialog
@summary put more words onscreen
@license MIT
@version 1.1.3
@requires Bitsy Version: 6.1
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
The paragraph break hack lets you get around this by using a (p) tag to immediately end the current page.

HOW TO USE:
	1. Copy-paste this script into a new script tag after the Bitsy source code.
	2. edit hackOptions below as needed
*/
import {
	inject,
} from './helpers/kitsy-script-toolkit';
import './paragraph-break';

export var hackOptions = {
	minRows: 2,
	maxRows: 4,
};

// override textbox height
inject(/textboxInfo\.height = .+;/,
	`Object.defineProperty(textboxInfo, 'height', {
	get() { return textboxInfo.padding_vert + (textboxInfo.padding_vert + relativeFontHeight()) * Math.max(${hackOptions.minRows}, dialogBuffer.CurPage().indexOf(dialogBuffer.CurRow())+Math.sign(dialogBuffer.CurCharCount())) + textboxInfo.arrow_height; }
})`);
// prevent textbox from caching
inject(/(if\(textboxInfo\.img == null\))/, '// $1');
// rewrite hard-coded row limit
inject(/(else if \(curRowIndex )== 0/g, '$1< ' + hackOptions.maxRows + ' - 1');
inject(/(if \(lastPage\.length) <= 1/, '$1 < ' + hackOptions.maxRows);

/**
📜
@file long dialog
@summary put more words onscreen
@license MIT
@version 1.0.0
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

Note: if you want to use this hack but still maintain the appearance of original bitsy dialog behaviour in some areas,
you can combine it with the paragraph break hack to manually add breaks every two lines.

HOW TO USE:
	1. Copy-paste this script into a new script tag after the Bitsy source code.
	2. edit hackOptions below as needed
*/
import {
	inject
} from "./helpers/kitsy-script-toolkit";

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
inject(/(if\( lastPage\.length) <= 1( \) {)/, '$1 < ' + hackOptions.maxRows + ' $2');

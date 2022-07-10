/**
📜
@file long dialog
@summary put more words onscreen
@license MIT
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

There is also a dialog tag that lets you change the size ingame.

Usage:
	(textboxsize "<min>,<max>")
	(textboxsizeNow "<min>,<max>")

Examples:
	(textboxsize "2,6")
	(textboxsizeNow "2,2")

HOW TO USE:
	1. Copy-paste this script into a new script tag after the Bitsy source code.
	2. edit hackOptions below as needed
*/
import bitsy from 'bitsy';
import { kitsy } from 'kitsy';
import { addDualDialogTag, after, before, inject } from './helpers/kitsy-script-toolkit';
import './paragraph-break';

export var hackOptions = {
	minRows: 2,
	maxRows: 4,
};

kitsy.longDialogOptions = hackOptions;

// override textbox height to be dynamic based on row count
inject(
	/textboxInfo\.height = .+;/,
	`Object.defineProperty(textboxInfo, 'height', {
	get() { return textboxInfo.padding_vert + (textboxInfo.padding_vert + relativeFontHeight()) * Math.max(window.kitsy.longDialogOptions.minRows, dialogBuffer.CurPage().indexOf(dialogBuffer.CurRow())+Math.sign(dialogBuffer.CurCharCount())) + textboxInfo.arrow_height; }
})`
);
// export textbox info
inject(/(var font = null;)/, 'this.textboxInfo = textboxInfo;$1');
// rewrite hard-coded row limit
inject(/(else if \(curRowIndex )== 0/g, '$1 < window.kitsy.longDialogOptions.maxRows - 1');
inject(/(if \(lastPage\.length) <= 1/, '$1 < window.kitsy.longDialogOptions.maxRows');

// update textbox size
var ph;
function updateTextbox() {
	var h = bitsy.dialogRenderer.textboxInfo.height;
	if (h === ph) return;
	ph = h;
	var textScale = bitsy.bitsy.textMode() === bitsy.bitsy.TXT_LOREZ ? 1 : 2;
	bitsy.bitsy.textbox(undefined, undefined, undefined, undefined, h * textScale);
}
before('dialogRenderer.Draw', updateTextbox);

// reserve textbox memory on startup to avoid flickering
// when it expands dynamically
after('dialogRenderer.SetFont', function () {
	var textScale = bitsy.bitsy.textMode() === bitsy.bitsy.TXT_LOREZ ? 1 : 2;
	bitsy.bitsy.textbox(undefined, undefined, undefined, bitsy.width * textScale, bitsy.height * textScale);
	bitsy.startDialog('{br}'.repeat(bitsy.height));
	bitsy.dialogBuffer.Skip();
	bitsy.dialogBuffer.EndDialog();
	bitsy.bitsy.textbox(undefined, undefined, undefined, bitsy.dialogRenderer.textboxInfo.width * textScale, bitsy.dialogRenderer.textboxInfo.height * textScale);
});

addDualDialogTag('textboxsize', function (environment, parameters) {
	if (!parameters[0]) {
		throw new Error('{textboxsize} was missing parameters! Usage: {textboxsize "minrows, maxrows"}');
	}
	// parse parameters
	var params = parameters[0].split(/,\s?/);
	var min = parseInt(params[0], 10);
	var max = parseInt(params[1], 10);
	hackOptions.minRows = min;
	hackOptions.maxRows = max;

	updateTextbox();
});

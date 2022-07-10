/**
👁️‍🗨️
@file transparent dialog
@summary makes the dialog box have a transparent background
@license MIT
@author Sean S. LeBlanc

@description
Makes the dialog box have a transparent background.

HOW TO USE:
Copy-paste into a script tag after the bitsy source
*/
import bitsy from 'bitsy';
import { after } from './helpers/kitsy-script-toolkit';

after('dialogRenderer.ClearTextbox', function () {
	bitsy.bitsy.fill(bitsy.bitsy.TEXTBOX, 0);
});

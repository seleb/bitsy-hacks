/**
🖼
@file dynamic background
@summary HTML background matching bitsy background
@license MIT
@version 2.1.3
@author Sean S. LeBlanc

@description
Updates the background of the html body to match the background colour of the bitsy palette.

HOW TO USE:
Copy-paste this script into a script tag after the bitsy source
*/
import bitsy from 'bitsy';
import {
	before,
	after,
} from './helpers/kitsy-script-toolkit';

var p1;
var p2;

function getBg() {
	try {
		p1 = bitsy.curPal();
	} catch (e) {
		p1 = null;
	}
}

// helper function which detects when the palette has changed,
// and updates the background to match
function updateBg() {
	// get the new palette
	p2 = bitsy.curPal();

	// if the palette changed, update background
	if (p1 !== p2) {
		document.body.style.background = 'rgb(' + bitsy.getPal(bitsy.curPal())[0].toString() + ')';
	}
}

// wrap every function which involves changing the palette
before('moveSprites', getBg);
before('movePlayer', getBg);
before('parseWorld', getBg);
after('moveSprites', updateBg);
after('movePlayer', updateBg);
after('parseWorld', updateBg);

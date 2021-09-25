/**
🔁
@file dialog box transition
@summary adds an easing transition animation to display the dialog box text
@license MIT
@author Delacannon

@description
A hack that adds an easing transition animation to display the dialog box text

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source.
*/

import { inject } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	easing: 0.025, //  easing speed
};

var drawOverride = `
if (isCentered) {
	bitsyDrawBegin(0);
	bitsyDrawTextbox(textboxInfo.left, ((height / 2) - (textboxInfo.height / 2)));
	bitsyDrawEnd();
	this.onExit = ((height/2)-(textboxInfo.height/2)) === ((height/2)-(textboxInfo.height/2))
}
else if (player().y < mapsize/2) {
	easingDialog(textboxInfo, ${hackOptions.easing}, !this.onClose
		? height-textboxInfo.bottom-textboxInfo.height
		: height+textboxInfo.height
	);
	this.onExit = this.onClose && textboxInfo.y >= height;
}
else {
	easingDialog(textboxInfo, ${hackOptions.easing}, !this.onClose
		? textboxInfo.top
		: -textboxInfo.top-textboxInfo.height
	);
	this.onExit = this.onClose && textboxInfo.y <= -textboxInfo.height;
}
return;`;

var functionEasing = `
	function easingDialog(tbox, easing, targetY) {
		var vy = (targetY - tbox.y) * easing;
		tbox.y += vy;
		bitsyDrawBegin(0);
		bitsyDrawTextbox(tbox.left, tbox.y);
		bitsyDrawEnd();
	}
	this.onClose = false;
	this.onExit = false;
`;

inject(/(this\.DrawTextbox\(\))/, '$1\nif(this.onExit && this.onClose){dialogBuffer.EndDialog()}');
inject(/(\/\/end dialog mode\s+this\.EndDialog\(\))/m, 'dialogRenderer.onClose=true');
inject(/(var DialogRenderer = function\(\) {)/, `$1${functionEasing}`);
inject(/(var textboxInfo = {)/, '$1y:0,');
inject(
	/(this\.Reset = function\(\) {)/,
	`$1 this.onClose=false;
		this.onExit=false;
		textboxInfo.y = player().y < mapsize/2 ? height : -(textboxInfo.height);`
);

inject(/(this\.DrawTextbox = function\(\) {)/, `$1${drawOverride}`);

/**
👁️‍🗨️
@file transparent dialog
@summary makes the dialog box have a transparent background
@license MIT
@version 1.1.4
@author Sean S. LeBlanc

@description
Makes the dialog box have a transparent background.

Note: this one's ~pretty hacky~.

HOW TO USE:
Copy-paste into a script tag after the bitsy source
*/
import bitsy from 'bitsy';
import {
	inject,
} from './helpers/kitsy-script-toolkit';

bitsy.transparentDialog = {
	canvas: document.createElement('canvas'),
};
bitsy.transparentDialog.context = bitsy.transparentDialog.canvas.getContext('2d');
var drawOverride = `
if(context == null) return;
transparentDialog.canvas.width = textboxInfo.width*scale;
transparentDialog.canvas.height = textboxInfo.height*scale;
transparentDialog.context.putImageData(textboxInfo.img, 0, 0);
if (isCentered) {
	context.drawImage(transparentDialog.canvas, textboxInfo.left*scale, ((height/2)-(textboxInfo.height/2))*scale);
} else if (player().y < mapsize/2) {
	context.drawImage(transparentDialog.canvas, textboxInfo.left*scale, (height-textboxInfo.bottom-textboxInfo.height)*scale);
}
else {
	context.drawImage(transparentDialog.canvas, textboxInfo.left*scale, textboxInfo.top*scale);
}
return;`;

// override textbox drawing to use draw image version from above
inject(/(this\.DrawTextbox = function\(\) {)/, '$1' + drawOverride);

// override textbox clearing pixels to be fully transparent
inject(/(textboxInfo\.img\.data\[i\+3\]=)255/, '$10');

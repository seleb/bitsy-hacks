/**
👁️‍🗨️
@file transparent dialog
@summary makes the dialog box have a transparent background
@license MIT
@version auto
@requires 8.0
@author Sean S. LeBlanc

@description
Makes the dialog box have a transparent background.

HOW TO USE:
Copy-paste into a script tag after the bitsy source
*/
import { inject } from './helpers/kitsy-script-toolkit';

inject(/(var colorIndex = color\.GetColorIndex\(COLOR_INDEX\.)TEXTBOX(\);)/, '$1TRANSPARENT$2');
inject(/(this\.DrawTextbox = function\(\) {)/, '$1\nbitsyTextureCommit(textboxInfo.textureId);');

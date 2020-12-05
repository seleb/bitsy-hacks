/**
🔀
@file logic-operators-extended
@summary adds conditional logic operators
@version auto
@requires 8.0
@author @mildmojo

@description
Adds conditional logic functions:
  - {AND x y}
  - {OR x y}
And modulo function:
  - {MOD x y}

Examples: {AND {GT candlecount 5} {IS haslighter 1}}
          {AND {AND {GT candlecount 5} {GT papercount 1} isIndoors}
          {OR {IS haslighter 1} {IS hasmatches 1}}
          {MOD candlecount 4}
*/

import { addDialogTag } from './helpers/kitsy-script-toolkit';

addDialogTag('AND', function (parameters, onReturn) {
	onReturn(parameters[0] && parameters[1]);
});
addDialogTag('OR', function (parameters, onReturn) {
	onReturn(parameters[0] || parameters[1]);
});
addDialogTag('MOD', function (parameters, onReturn) {
	onReturn(parameters[0] % parameters[1]);
});

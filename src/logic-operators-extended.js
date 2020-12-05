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

import { inject } from './helpers/kitsy-script-toolkit';

var operators = [
	['AND', '&&'],
	['OR', '||'],
	['MOD', '%'],
];

inject(
	/(return instanceEnv;)/,
	`
	${operators
		.map(function (operator) {
			return `instanceEnv.Set("${operator[0]}", function(parameters, onReturn) {
			onReturn(parameters[0] ${operator[1]} parameters[1]);
		});`;
		})
		.join('\n')}
	$1
`,
);

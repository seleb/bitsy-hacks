/**
🔀
@file logic-operators-extended
@summary adds conditional logic operators
@version auto
@author @mildmojo

@description
Adds conditional logic operators:
  - !== (not equal to)
  - && (and)
  - || (or)
  - % (modulo)

Examples: candlecount > 5 && haslighter == 1
          candlecount > 5 && papercount > 1 && isIndoors
          haslighter == 1 || hasmatches == 1
          candlecount > 5 && candlecount !== 666
          candlecount > 5 &&! droppedlighter
          droppedlighter ||! hasmatches

NOTE: The combining operators (&&, ||, &&!, ||!) have lower precedence than
      all other math and comparison operators, so it might be hard to write
      tests that mix and match these new operators and have them evaluate
      correctly. If you're using multiple `&&` and `||` operators in one
      condition, be sure to test every possibility to make sure it behaves
      the way you want.
*/

import {
	inject,
} from './helpers/kitsy-script-toolkit';

var operators = ['!==', '&&', '||', '%'];

function expression(operator) {
	return `function (environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal ${operator} rVal);
		});
	});
}`;
}

inject(/(operatorMap\.set\("-", subExp\);)/, `
	$1
	${operators.map(function (operator) {
		return `operatorMap.set("${operator}", ${expression(operator)});`;
	}).join('\n')}
`);
inject(
	/(Operators : \[)(.+\],)/,
	`$1 ${operators.map(function (operator) {
		return `"${operator}", `;
	}).join('')} $2`,
);

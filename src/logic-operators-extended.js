/**
🔀
@file logic-operators-extended
@summary adds conditional logic operators
@version 1.0.5
@author @mildmojo

@description
Adds conditional logic operators:
  - !== (not equal to)
  - && (and)
  - || (or)
  - &&! (and not)
  - ||! (or not)

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
'use strict';
import bitsy from "bitsy";
import {
	inject
} from "./helpers/kitsy-script-toolkit";

inject(/(operatorMap\.set\("-", subExp\);)/,[
	'$1',
	'operatorMap.set("&&", andExp);',
	'operatorMap.set("||", orExp);',
	'operatorMap.set("&&!", andNotExp);',
	'operatorMap.set("||!", orNotExp);',
	'operatorMap.set("!==", notEqExp);'
].join('\n'));
inject(
	/(var operatorSymbols = \["-", "\+", "\/", "\*", "<=", ">=", "<", ">", "=="\];)/,
	'$1operatorSymbols.unshift("!==", "&&", "||", "&&!", "||!");'
);

bitsy.andExp = function andExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal && rVal);
		});
	});
};

bitsy.orExp = function orExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal || rVal);
		});
	});
};

bitsy.notEqExp = function notEqExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal !== rVal);
		});
	});
};

bitsy.andNotExp = function andNotExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal && !rVal);
		});
	});
};

bitsy.orNotExp = function orNotExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal || !rVal);
		});
	});
};
// End of logic operators mod

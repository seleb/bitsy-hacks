/**
🔡
@file expose variables
@summary exposes the bitsy variable map globally
@license MIT
@version 1.0.0
@requires 5.3
@author Sean S. LeBlanc

@description
Exposes the bitsy variable map globally as a kitsy variable.
It can be accessed with `window.kitsy.variableMap`,
or `bitsy.kitsy.variableMap` in other hack source code.

Note that it is a Map object, not a plain object,
and so has `.get` and `.set` functions instead of regular read/write syntax.

HOW TO USE:
Copy-paste into a script tag after the bitsy source
*/
import {
	inject,
} from "./helpers/kitsy-script-toolkit";

inject(/(var variableMap = new Map\(\);)/, '$1window.kitsy.variableMap = variableMap;');

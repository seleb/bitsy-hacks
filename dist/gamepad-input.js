/**
🎮
@file gamepad input
@summary HTML5 gamepad support
@license MIT
@version 15.4.5
@requires Bitsy Version: 5.1
@author Sean S. LeBlanc

@description
Adds support for gamepad input.

Directional input is mapped to the left and right analog sticks, the dpad, and the face buttons (e.g. ABXY).
The same hold-to-move logic used for keyboard input is shared with the gamepad input.

HOW TO USE:
Copy-paste this script into a script tag after the bitsy source
*/
(function (bitsy) {
'use strict';

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

bitsy = bitsy || /*#__PURE__*/_interopDefaultLegacy(bitsy);

var Buttons;
(function (Buttons) {
    // XBOX360 wired controller configuration
    Buttons[Buttons["A"] = 0] = "A";
    Buttons[Buttons["X"] = 2] = "X";
    Buttons[Buttons["B"] = 1] = "B";
    Buttons[Buttons["Y"] = 3] = "Y";
    Buttons[Buttons["LB"] = 4] = "LB";
    Buttons[Buttons["RB"] = 5] = "RB";
    Buttons[Buttons["LT"] = 6] = "LT";
    Buttons[Buttons["RT"] = 7] = "RT";
    Buttons[Buttons["BACK"] = 8] = "BACK";
    Buttons[Buttons["START"] = 9] = "START";
    Buttons[Buttons["LHAT"] = 10] = "LHAT";
    Buttons[Buttons["RHAT"] = 11] = "RHAT";
    Buttons[Buttons["DPAD_UP"] = 12] = "DPAD_UP";
    Buttons[Buttons["DPAD_DOWN"] = 13] = "DPAD_DOWN";
    Buttons[Buttons["DPAD_LEFT"] = 14] = "DPAD_LEFT";
    Buttons[Buttons["DPAD_RIGHT"] = 15] = "DPAD_RIGHT";
})(Buttons || (Buttons = {}));
var Axes;
(function (Axes) {
    Axes[Axes["LSTICK_H"] = 0] = "LSTICK_H";
    Axes[Axes["LSTICK_V"] = 1] = "LSTICK_V";
    Axes[Axes["RSTICK_H"] = 2] = "RSTICK_H";
    Axes[Axes["RSTICK_V"] = 3] = "RSTICK_V";
})(Axes || (Axes = {}));
var nullGamepad = {
    original: {
        axes: [],
        buttons: [],
        connected: false,
    },
    disabled: true,
    down: {},
    justDown: {},
    justUp: {},
    axesPrev: {},
};
var Gamepads = /** @class */ (function () {
    /**
    * initialize gamepads
    */
    function Gamepads() {
        var _this = this;
        // settings
        /** if `abs(an axis value)` is < `deadZone`, returns 0 instead */
        this.deadZone = 0.25;
        /** if `abs(1-an axis value)` is < `snapZone`, returns 1 instead */
        this.snapZone = 0.25;
        /** axis values between `deadZone` and `snapZone` will be run through this function
        *
        * defaults to normalizing between the two thresholds */
        this.interpolate = function (value) {
            var v = Math.max(0, Math.min(1, (value - _this.deadZone) / (1.0 - _this.snapZone - _this.deadZone)));
            return v;
        };
        // internal vars
        this.players = {};
        this.available = false;
        this.pollEveryFrame = false;
        this.connected = false;
        /**
        * update gamepads (clears arrays, polls connections, etc.)
        */
        this.pollconnections = function () {
            _this.connected = false;
            // assume existing players' gamepads aren't enabled until they're found
            Object.values(_this.players).forEach(function (player) {
                player.disabled = true;
            });
            var gps = navigator.getGamepads();
            for (var i = 0; i < gps.length; ++i) {
                var gp = gps[i];
                if (gp) {
                    if (gp.connected) {
                        if (_this.players[gp.index] == null) {
                            // new player
                            _this.players[gp.index] = {
                                disabled: false,
                                original: gp,
                                down: {},
                                justDown: {},
                                justUp: {},
                                axesPrev: {},
                            };
                        }
                        else {
                            // returning player, just assign the gamepad
                            _this.players[gp.index].original = gp;
                        }
                        _this.connected = true;
                        _this.players[gp.index].disabled = false;
                    }
                    else {
                        delete _this.players[gp.index];
                    }
                }
            }
        };
        /**
        * update gamepads (clears arrays, polls connections, etc.)
        */
        this.update = function () {
            // store the previous axis values
            // has to be done before pollConnections since that will get the new axis values
            Object.keys(_this.players).forEach(function (i) {
                var _a;
                var p = _this.getPlayer(i);
                if ((_a = p === null || p === void 0 ? void 0 : p.original) === null || _a === void 0 ? void 0 : _a.axes) {
                    p.axesPrev = p.original.axes.slice();
                }
            });
            // poll connections and update gamepad states every frame because chrome's a lazy bum
            if (_this.pollEveryFrame) {
                _this.pollconnections();
            }
            Object.keys(_this.players).forEach(function (i) {
                var _a;
                var p = _this.getPlayer(i);
                if ((_a = p === null || p === void 0 ? void 0 : p.original) === null || _a === void 0 ? void 0 : _a.buttons) {
                    for (var j = 0; j < p.original.buttons.length; ++j) {
                        if (p.original.buttons[j].pressed) {
                            p.justDown[j] = !(p.down[j] === true);
                            p.down[j] = true;
                            p.justUp[j] = false;
                        }
                        else {
                            p.justUp[j] = p.down[j] === true;
                            p.down[j] = false;
                            p.justDown[j] = false;
                        }
                    }
                }
            });
        };
        /**
        * @returns `player`'s gamepad
        *
        * if one doesn't exist, returns an object with gamepad properties reflecting a null state
        */
        this.getPlayer = function (player) {
            var _a, _b, _c;
            if (((_b = (_a = _this.players[player]) === null || _a === void 0 ? void 0 : _a.original) === null || _b === void 0 ? void 0 : _b.connected) && !((_c = _this.players[player]) === null || _c === void 0 ? void 0 : _c.disabled)) {
                return _this.players[player];
            }
            return nullGamepad;
        };
        /**
        * @returns an array representing `length` axes for `player` at `offset`
        *
        * if `abs(an axis value)` is < `deadZone`, returns 0 instead
        * if `abs(1-an axis value)` is < `snapZone`, returns 1/-1 instead
        * otherwise, returns the axis value normalized between `deadZone` and `(1-snapZone)`
        * @param {Number} offset axis index
        * @param {Number} length number of axes to return
        * @param {Number} player player index (`undefined` for "sum of all")
        * @param {boolean} prev if `true` uses axis values from previous update
        */
        this.getAxes = function (offset, length, player, prev) {
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 2; }
            if (prev === void 0) { prev = false; }
            var axes = [];
            for (var i = 0; i < length; ++i) {
                axes[i] = 0;
            }
            if (player === undefined) {
                Object.keys(_this.players).forEach(function (i) {
                    var a = _this.getAxes(offset, length, i, prev);
                    for (var j = 0; j < a.length; ++j) {
                        axes[j] += a[j];
                    }
                });
            }
            else {
                var p = _this.getPlayer(player);
                if (p === null || p === void 0 ? void 0 : p.original) {
                    var axesSource = prev ? p.axesPrev : p.original.axes;
                    var a = Object.values(axesSource).slice(offset, offset + length);
                    for (var i = 0; i < a.length; ++i) {
                        if (Math.abs(a[i]) < _this.deadZone) {
                            axes[i] += 0;
                        }
                        else if (Math.abs(1.0 - a[i]) < _this.snapZone) {
                            axes[i] += 1;
                        }
                        else if (Math.abs(-1.0 - a[i]) < _this.snapZone) {
                            axes[i] -= 1;
                        }
                        else {
                            axes[i] += Math.sign(a[i]) * _this.interpolate(Math.abs(a[i]));
                        }
                    }
                }
            }
            return axes;
        };
        /**
       * @returns equivalent to `getAxes(axis, 1, player, prev)[0]`
       */
        this.getAxis = function (axis, player, prev) { return _this.getAxes(axis, 1, player, prev)[0]; };
        /**
        * @returns `true` if `axis` is past `threshold` in `direction`
        * @param {Number} axis axis index
        * @param {Number} threshold threshold (-1 to 1)
        * @param {Number} direction direction (-1|1) (if `undefined`, assumes the sign of `theshold` is the direction (e.g. if `theshold` is -0.5, it will check if the axis is < -0.5))
        * @param {Number} player player index (`undefined` for "any")
        * @param {boolean} prev if `true` uses axis values from previous update
        */
        this.axisPast = function (axis, threshold, direction, player, prev) {
            if (!threshold) {
                throw new Error('must specify a non-zero threshold');
            }
            if (!direction) {
                direction = threshold > 0 ? 1 : -1;
            }
            var a = _this.getAxis(axis, player, prev);
            return direction < 0 ? a < threshold : a > threshold;
        };
        /**
        * @returns `true` if `axis` is past `threshold` in `direction` and WAS NOT in previous update
        * @param {Number} axis axis index
        * @param {Number} threshold threshold (-1 to 1)
        * @param {Number} direction direction (-1|1) (if `undefined`, assumes the sign of `theshold` is the direction (e.g. if `theshold` is -0.5, it will check if the axis is < -0.5))
        * @param {Number} player player index (`undefined` for "any")
        */
        this.axisJustPast = function (axis, threshold, direction, player) { return _this.axisPast(axis, threshold, direction, player, false)
            && !_this.axisPast(axis, threshold, direction, player, true); };
        /**
        * @returns `[x,y]` representing the dpad for `player`
        * @param {Number} player player index (`undefined` for "sum of all")
        */
        this.getDpad = function (player) {
            var x = 0;
            var y = 0;
            if (player === undefined) {
                Object.keys(_this.players).forEach(function (i) {
                    var _a = _this.getDpad(i), ix = _a[0], iy = _a[1];
                    x += ix;
                    y += iy;
                });
            }
            else {
                if (_this.isDown(Buttons.DPAD_RIGHT, player)) {
                    x += 1;
                }
                if (_this.isDown(Buttons.DPAD_LEFT, player)) {
                    x -= 1;
                }
                if (_this.isDown(Buttons.DPAD_UP, player)) {
                    y += 1;
                }
                if (_this.isDown(Buttons.DPAD_DOWN, player)) {
                    y -= 1;
                }
            }
            return [x, y];
        };
        /**
        * @returns `true` if `player`'s `btn` is currently down
        * @param {Number} btn button index
        * @param {Number} player player index (`undefined` for "any")
        */
        this.isDown = function (btn, player) {
            if (btn === undefined) {
                throw new Error('must specify a button');
            }
            if (player === undefined) {
                return Object.keys(_this.players).some(function (i) { return _this.isDown(btn, i); });
            }
            return _this.getPlayer(player).down[btn];
        };
        /**
        * @returns equivalent to `!isDown(btn, player)`
        * @param {Number} btn button index
        * @param {Number} player player index (`undefined` for "any")
        */
        this.isUp = function (btn, player) { return !_this.isDown(btn, player); };
        /**
        * @returns `true` if `player`'s `btn` is currently down and WAS NOT in previous update
        * @param {Number} btn button index
        * @param {Number} player player index (`undefined` for "any")
        */
        this.isJustDown = function (btn, player) {
            if (btn === undefined) {
                throw new Error('must specify a button');
            }
            if (player === undefined) {
                return Object.keys(_this.players).some(function (i) { return _this.isJustDown(btn, i); });
            }
            return _this.getPlayer(player).justDown[btn];
        };
        /**
        * @returns `true` if `player`'s `btn` is currently NOT down and WAS down in previous update
        * @param {Number} btn button index
        * @param {Number} player player index (`undefined` for "any")
        */
        this.isJustUp = function (btn, player) {
            if (btn === undefined) {
                throw new Error('must specify a button');
            }
            if (player === undefined) {
                return Object.keys(_this.players).some(function (i) { return _this.isJustUp(btn, i); });
            }
            return _this.getPlayer(player).justUp[btn];
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        if (navigator.getGamepads) {
            this.available = true;
        }
        else if (navigator.webkitGetGamepads) {
            navigator.getGamepads = navigator.webkitGetGamepads;
            this.available = true;
        }
        if (this.available) {
            if (navigator.userAgent.includes('Firefox')) {
                // listen to connection events for firefox
                window.addEventListener('gamepadconnected', this.pollconnections.bind(this));
                window.addEventListener('gamepaddisconnected', this.pollconnections.bind(this));
            }
            else {
                this.pollEveryFrame = true;
            }
        }
    }
    return Gamepads;
}());

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
*/

/*
Helper used to replace code in a script tag based on a search regex
To inject code without erasing original string, using capturing groups; e.g.
	inject(/(some string)/,'injected before $1 injected after')
*/
function inject(searchRegex, replaceString) {
	// find the relevant script tag
	var scriptTags = document.getElementsByTagName('script');
	var scriptTag;
	var code;
	for (var i = 0; i < scriptTags.length; ++i) {
		scriptTag = scriptTags[i];
		var matchesSearch = scriptTag.textContent.search(searchRegex) !== -1;
		var isCurrentScript = scriptTag === document.currentScript;
		if (matchesSearch && !isCurrentScript) {
			code = scriptTag.textContent;
			break;
		}
	}

	// error-handling
	if (!code) {
		throw new Error('Couldn\'t find "' + searchRegex + '" in script tags');
	}

	// modify the content
	code = code.replace(searchRegex, replaceString);

	// replace the old script tag with a new one using our modified code
	var newScriptTag = document.createElement('script');
	newScriptTag.textContent = code;
	scriptTag.insertAdjacentElement('afterend', newScriptTag);
	scriptTag.remove();
}

/**
 * Helper for getting an array with unique elements
 * @param  {Array} array Original array
 * @return {Array}       Copy of array, excluding duplicates
 */
function unique(array) {
	return array.filter(function (item, idx) {
		return array.indexOf(item) === idx;
	});
}

/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
HOW TO USE:
  import {before, after, inject, addDialogTag, addDeferredDialogTag} from "./helpers/kitsy-script-toolkit";

  before(targetFuncName, beforeFn);
  after(targetFuncName, afterFn);
  inject(searchRegex, replaceString);
  addDialogTag(tagName, dialogFn);
  addDeferredDialogTag(tagName, dialogFn);

  For more info, see the documentation at:
  https://github.com/seleb/bitsy-hacks/wiki/Coding-with-kitsy
*/

// Ex: before('load_game', function run() { alert('Loading!'); });
//     before('show_text', function run(text) { return text.toUpperCase(); });
//     before('show_text', function run(text, done) { done(text.toUpperCase()); });
function before(targetFuncName, beforeFn) {
	var kitsy = kitsyInit();
	kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
	kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
}

// Ex: after('load_game', function run() { alert('Loaded!'); });
function after(targetFuncName, afterFn) {
	var kitsy = kitsyInit();
	kitsy.queuedAfterScripts[targetFuncName] = kitsy.queuedAfterScripts[targetFuncName] || [];
	kitsy.queuedAfterScripts[targetFuncName].push(afterFn);
}

function kitsyInit() {
	// return already-initialized kitsy
	if (bitsy.kitsy) {
		return bitsy.kitsy;
	}

	// Initialize kitsy
	bitsy.kitsy = {
		queuedInjectScripts: [],
		queuedBeforeScripts: {},
		queuedAfterScripts: {},
	};

	var oldStartFunc = bitsy.startExportedGame;
	bitsy.startExportedGame = function doAllInjections() {
		// Only do this once.
		bitsy.startExportedGame = oldStartFunc;

		// Rewrite scripts and hook everything up.
		doInjects();
		applyAllHooks();

		// Start the game
		bitsy.startExportedGame.apply(this, arguments);
	};

	return bitsy.kitsy;
}

function doInjects() {
	bitsy.kitsy.queuedInjectScripts.forEach(function (injectScript) {
		inject(injectScript.searchRegex, injectScript.replaceString);
	});
	reinitEngine();
}

function applyAllHooks() {
	var allHooks = unique(Object.keys(bitsy.kitsy.queuedBeforeScripts).concat(Object.keys(bitsy.kitsy.queuedAfterScripts)));
	allHooks.forEach(applyHook);
}

function applyHook(functionName) {
	var functionNameSegments = functionName.split('.');
	var obj = bitsy;
	while (functionNameSegments.length > 1) {
		obj = obj[functionNameSegments.shift()];
	}
	var lastSegment = functionNameSegments[0];
	var superFn = obj[lastSegment];
	var superFnLength = superFn ? superFn.length : 0;
	var functions = [];
	// start with befores
	functions = functions.concat(bitsy.kitsy.queuedBeforeScripts[functionName] || []);
	// then original
	if (superFn) {
		functions.push(superFn);
	}
	// then afters
	functions = functions.concat(bitsy.kitsy.queuedAfterScripts[functionName] || []);

	// overwrite original with one which will call each in order
	obj[lastSegment] = function () {
		var returnVal;
		var args = [].slice.call(arguments);
		var i = 0;

		function runBefore() {
			// All outta functions? Finish
			if (i === functions.length) {
				return returnVal;
			}

			// Update args if provided.
			if (arguments.length > 0) {
				args = [].slice.call(arguments);
			}

			if (functions[i].length > superFnLength) {
				// Assume funcs that accept more args than the original are
				// async and accept a callback as an additional argument.
				return functions[i++].apply(this, args.concat(runBefore.bind(this)));
			}
			// run synchronously
			returnVal = functions[i++].apply(this, args);
			if (returnVal && returnVal.length) {
				args = returnVal;
			}
			return runBefore.apply(this, args);
		}

		return runBefore.apply(this, arguments);
	};
}

function reinitEngine() {
	// recreate the script and dialog objects so that they'll be
	// referencing the code with injections instead of the original
	bitsy.scriptModule = new bitsy.Script();
	bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();

	bitsy.dialogModule = new bitsy.Dialog();
	bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
	bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();
}



var gamepads = new Gamepads();
var empty = function () {};

var move = function (dpad, face, axis, axis2, axispast, axisdir, key) {
	// keydown
	if (
		gamepads.isJustDown(dpad)
		|| gamepads.isJustDown(face)
		|| gamepads.axisJustPast(axis, axispast, axisdir)
		|| gamepads.axisJustPast(axis2, axispast, axisdir)
		|| (
			bitsy.playerHoldToMoveTimer <= 0 && (
				gamepads.isDown(dpad)
				|| gamepads.isDown(face)
				|| gamepads.axisPast(axis, axispast, axisdir)
			)
		)
	) {
		bitsy.curPlayerDirection = bitsy.Direction.None;
		bitsy.input.onkeydown({
			keyCode: key,
			preventDefault: empty,
		});
	}

	// keyup
	if (
		gamepads.isJustUp(dpad)
		|| gamepads.isJustUp(face)
		|| gamepads.axisJustPast(axis, axispast, -axisdir)
		|| gamepads.axisJustPast(axis2, axispast, -axisdir)
	) {
		bitsy.input.onkeyup({
			keyCode: key,
			preventDefault: empty,
		});
	}
};

before('update', function () {
	move(Buttons.DPAD_LEFT, Buttons.X, Axes.LSTICK_H, Axes.RSTICK_H, -0.5, -1, bitsy.key.left);
	move(Buttons.DPAD_RIGHT, Buttons.B, Axes.LSTICK_H, Axes.RSTICK_H, 0.5, 1, bitsy.key.right);
	move(Buttons.DPAD_UP, Buttons.Y, Axes.LSTICK_V, Axes.RSTICK_V, -0.5, -1, bitsy.key.up);
	move(Buttons.DPAD_DOWN, Buttons.A, Axes.LSTICK_V, Axes.RSTICK_V, 0.5, 1, bitsy.key.down);
});
after('update', function () {
	gamepads.update();
});

}(window));

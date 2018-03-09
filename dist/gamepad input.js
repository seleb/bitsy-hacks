/**
🎮
@file gamepad input
@summary HTML5 gamepad support
@license MIT
@version 1.0.0
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

bitsy = bitsy && bitsy.hasOwnProperty('default') ? bitsy['default'] : bitsy;

var gamepads = {
	// XBOX360 wired controller configuration
	// buttons
	A: 0,
	X: 2,
	B: 1,
	Y: 3,
	LB: 4,
	RB: 5,
	LT: 6,
	RT: 7,
	BACK: 8,
	START: 9,
	LHAT: 10,
	RHAT: 11,
	DPAD_UP: 12,
	DPAD_DOWN: 13,
	DPAD_LEFT: 14,
	DPAD_RIGHT: 15,

	// axes
	LSTICK_H: 0,
	LSTICK_V: 1,
	RSTICK_H: 2,
	RSTICK_V: 3,


	players: [],

	available: false,
	pollEveryFrame: false,
	connected: false,
	deadZone: 0.25, // if abs(an axis value) is < deadZone, returns 0 instead
	snapZone: 0.25, // if abs(1-an axis value) is < snapZone, returns 1 instead

	init: function () {
		if (navigator.getGamepads) {
			this.available = true;
		} else if (navigator.webkitGetGamepads) {
			navigator.getGamepads = navigator.webkitGetGamepads;
			this.available = true;
		}

		if (this.available) {
			console.log("Gamepad API available");
			if (navigator.userAgent.indexOf('Firefox/') != -1) {
				// listen to connection events for firefox
				window.addEventListener("gamepadconnected", function (event) {
					console.log("gamepad connection event");
					this.pollconnections(event);
				}.bind(this));
				window.addEventListener("gamepaddisconnected", function (event) {
					console.log("gamepad connection event");
					this.pollconnections(event);
				}.bind(this));
			} else {
				this.pollEveryFrame = true;
			}
		} else {
			console.error("Gamepad API not available");
		}
	},

	pollconnections: function (event) {
		this.connected = false;

		// assume existing players' gamepads aren't enabled until they're found
		for (var i = 0; i < this.players.length; ++i) {
			if (this.players[i]) {
				this.players[i].disabled = true;
			}
		}

		var gps = navigator.getGamepads();
		for (var i = 0; i < gps.length; ++i) {
			var gp = gps[i];
			if (gp) {
				if (gp.connected) {
					if (this.players[gp.index] == null) {
						// new player
						gp.down = [];
						gp.justDown = [];
						gp.justUp = [];
						gp.axesPrev = [];
						this.players[gp.index] = gp;
					} else {
						// returning player, copy old button states before replacing
						gp.down = this.players[gp.index].down;
						gp.justDown = this.players[gp.index].justDown;
						gp.justUp = this.players[gp.index].justUp;
						gp.axesPrev = this.players[gp.index].axesPrev;
						this.players[gp.index] = gp;
					}
					this.connected = true;
					this.players[gp.index].disabled = false;
				} else {
					this.players[gp.index] = null;
				}
			}
		}
	},

	update: function () {
		// store the previous axis values
		// has to be done before pollConnections since that will get the new axis values
		for (var i = 0; i < this.players.length; ++i) {
			var p = this.getPlayer(i);
			p.axesPrev = p.axes.slice();
		}

		// poll connections and update gamepad states every frame because chrome's a lazy bum
		if (this.pollEveryFrame) {
			this.pollconnections();
		}

		for (var i = 0; i < this.players.length; ++i) {
			var p = this.getPlayer(i);
			if (p && p != null) {
				for (var j = 0; j < p.buttons.length; ++j) {
					if (p.buttons[j].pressed) {
						p.justDown[j] = !(p.down[j] === true);
						p.down[j] = true;
						p.justUp[j] = false;
					} else {
						p.justUp[j] = p.down[j] === true;
						p.down[j] = false;
						p.justDown[j] = false;
					}
				}
			}

		}
	},

	// returns _player's gamepad
	// if one doesn't exist, returns an object with gamepad properties reflecting a null state
	getPlayer: function (_player) {
		if (this.players[_player] && this.players[_player].connected && !this.players[_player].disabled) {
			return this.players[_player];
		} else {
			return {
				connected: false,
				disabled: true,
				down: [],
				justDown: [],
				justUp: [],
				axes: [],
				axesPrev: [],
				buttons: []
			};
		}
	},

	// returns an array representing _length axes for _player at _offset
	// if abs(an axis value) is < deadZone, returns 0 instead
	// if abs(1-an axis value) is < snapZone, returns 1/-1 instead
	// otherwise, returns the axis value, normalized between deadZone and (1-snapZone)
	// if _offset isn't set, sets to 0
	// if _length isn't set, sets to 2
	// if _player isn't set (or -1), returns the sum of everyone's axes
	// if _prev is set and true, uses the axis values from the previous frame instead of the current one
	getAxes: function (_offset, _length, _player, _prev) {
		if (arguments.length < 4) {
			_prev = false;
			if (arguments.length < 3) {
				_player = -1;
				if (arguments.length < 2) {
					_length = 2;
					if (arguments.length < 1) {
						_offset = 0;
					}
				}
			}
		}

		var axes = [];
		for (var i = 0; i < _length; ++i) {
			axes[i] = 0;
		}
		if (_player == -1) {
			for (var i = 0; i < this.players.length; ++i) {
				var a = this.getAxes(_offset, _length, i, _prev);
				for (var j = 0; j < a.length; ++j) {
					axes[j] += a[j];
				}
			}
		} else {
			var p = this.getPlayer(_player);
			var a = _prev ? p.axesPrev : p.axes;
			a = a.slice(_offset, _offset + _length);
			for (var i = 0; i < a.length; ++i) {
				if (Math.abs(a[i]) < this.deadZone) {
					axes[i] += 0;
				} else if (Math.abs(1.0 - a[i]) < this.snapZone) {
					axes[i] += 1;
				} else if (Math.abs(-1.0 - a[i]) < this.snapZone) {
					axes[i] -= 1;
				} else {
					axes[i] += Math.sign(a[i]) * (Math.abs(a[i]) - this.deadZone) / (1.0 - this.snapZone - this.deadZone);
				}
			}
		}
		return axes;
	},
	// returns getAxes(_axis,1,_player)[0]
	// if _player isn't set, returns the sum of everyone's axis
	// if _prev is set and true, uses the axis values from the previous frame instead of the current one
	getAxis: function (_axis, _player, _prev) {
		if (arguments.length < 3) {
			_prev = false;
			if (arguments.length < 2) {
				_player = -1;
			}
		}
		return this.getAxes(_axis, 1, _player, _prev)[0];
	},

	// returns true if _axis is past _threshold in _direction
	// if _direction isn't set, assumes the sign of _theshold is the direction (e.g. if the theshold is -0.5, it will check if _axis is < -0.5)
	// if _player isn't set, returns true for any player
	// if _prev is set and true, uses the axis values from the previous frame instead of the current one
	axisPast: function (_axis, _threshold, _direction, _player, _prev) {
		if (arguments.length < 5) {
			_prev = false;
			if (arguments.length < 4) {
				_player = -1;
				if (arguments.length < 3) {
					_direction = Math.sign(_threshold);
					if (arguments.length < 2) {
						console.error("must specify axis and threshold");
					}
				}
			}
		}

		var a = this.getAxis(_axis, _player, _prev);



		if (_direction < 0) {
			return a < _threshold;
		} else if (_direction > 0) {
			return a > _threshold;
		} else {
			console.error("direction can't be zero");
		}
	},
	// returns true if _axis is past _threshold in _direction and WAS NOT in previous update
	// if _direction isn't set, assumes the sign of _theshold is the direction (e.g. if the theshold is -0.5, it will check if _axis is < -0.5)
	// if _player isn't set, returns true for any player
	axisJustPast: function (_axis, _threshold, _direction, _player) {
		if (arguments.length < 4) {
			_player = -1;
			if (arguments.length < 3) {
				_direction = Math.sign(_threshold);
				if (arguments.length < 2) {
					console.error("must specify axis and threshold");
				}
			}
		}
		return this.axisPast(_axis, _threshold, _direction, _player, false) && !this.axisPast(_axis, _threshold, _direction, _player, true);
	},

	// returns [x,y] representing the dpad for _player
	// if _player isn't set (or -1), returns the sum of everyone's dpads
	getDpad: function (_player) {
		if (arguments.length < 1) {
			_player = -1;
		}
		var dpad = [0, 0];
		if (_player == -1) {
			for (var i = 0; i < this.players.length; ++i) {
				var d = this.getDpad(i);
				dpad[0] += d[0];
				dpad[1] += d[1];
			}
		} else {
			if (this.isDown(this.DPAD_RIGHT, _player)) {
				dpad[0] += 1;
			}
			if (this.isDown(this.DPAD_LEFT, _player)) {
				dpad[0] -= 1;
			}
			if (this.isDown(this.DPAD_UP, _player)) {
				dpad[1] += 1;
			}
			if (this.isDown(this.DPAD_DOWN, _player)) {
				dpad[1] -= 1;
			}
		}
		return dpad;
	},

	// returns true if _player's _btn is currently down
	// if _player isn't set (or -1), returns true for any player
	isDown: function (_btn, _player) {
		if (arguments.length < 2) {
			_player = -1;
			if (arguments.length < 1) {
				console.error("must specify a button");
			}
		}
		if (_player == -1) {
			for (var i = 0; i < this.players.length; ++i) {
				if (this.isDown(_btn, i)) {
					return true;
				}
			}
			return false;
		} else {
			return this.getPlayer(_player).down[_btn] === true;
		}
	},

	// returns true if _player's _btn is not currently down
	// if _player isn't set (or -1), returns true for any player
	isUp: function (_btn, _player) {
		return !this.isDown(_btn, _player);
	},

	// returns true if _player's _btn is currently down and WAS NOT down in previous update
	// if _player isn't set (or -1), returns true for any player
	isJustDown: function (_btn, _player) {
		if (arguments.length < 2) {
			_player = -1;
			if (arguments.length < 1) {
				console.error("must specify a button");
			}
		}
		if (_player == -1) {
			for (var i = 0; i < this.players.length; ++i) {
				if (this.isJustDown(_btn, i)) {
					return true;
				}
			}
			return false;
		} else {
			return this.getPlayer(_player).justDown[_btn] === true;
		}
	},

	// returns true if _player's _btn is currently NOT down and WAS down in previous update
	// if _player isn't set (or -1), returns true for any player
	isJustUp: function (_btn, _player) {
		if (arguments.length < 2) {
			_player = -1;
			if (arguments.length < 1) {
				console.error("must specify a button");
			}
		}
		if (_player == -1) {
			for (var i = 0; i < this.players.length; ++i) {
				if (this.isJustUp(_btn, i)) {
					return true;
				}
			}
			return false;
		} else {
			return this.getPlayer(_player).justUp[_btn] === true
		}	}
};

var inputGamepads = gamepads;



var _startExportedGame = bitsy.startExportedGame;
bitsy.startExportedGame = function () {
	inputGamepads.init();
	if (_startExportedGame) {
		_startExportedGame();
	}
};
var empty = function () {};

var move = function (dpad, face, axis, axis2, axispast, axisdir, key) {
	// keydown
	if (
		inputGamepads.isJustDown(dpad) ||
		inputGamepads.isJustDown(face) ||
		inputGamepads.axisJustPast(axis, axispast, axisdir) ||
		(
			bitsy.playerHoldToMoveTimer <= 0 && (
				inputGamepads.isDown(dpad) ||
				inputGamepads.isDown(face) ||
				inputGamepads.axisPast(axis, axispast, axisdir)
			)
		)
	) {
		bitsy.curPlayerDirection = bitsy.Direction.None;
		bitsy.onkeydown({
			keyCode: key,
			preventDefault: empty
		});
	}

	// keyup
	if (
		inputGamepads.isJustUp(dpad) ||
		inputGamepads.isJustUp(face) ||
		inputGamepads.axisJustPast(axis, axispast, -axisdir)
	) {
		bitsy.onkeyup({
			keyCode: key,
			preventDefault: empty
		});
	}
};

var _update = bitsy.update;
bitsy.update = function () {
	move(inputGamepads.DPAD_LEFT, inputGamepads.X, inputGamepads.LSTICK_H, inputGamepads.RSTICK_H, -0.5, -1, bitsy.key.left);
	move(inputGamepads.DPAD_RIGHT, inputGamepads.B, inputGamepads.LSTICK_H, inputGamepads.RSTICK_H, 0.5, 1, bitsy.key.right);
	move(inputGamepads.DPAD_UP, inputGamepads.Y, inputGamepads.LSTICK_V, inputGamepads.RSTICK_V, -0.5, -1, bitsy.key.up);
	move(inputGamepads.DPAD_DOWN, inputGamepads.A, inputGamepads.LSTICK_V, inputGamepads.RSTICK_V, 0.5, 1, bitsy.key.down);

	if (_update) {
		_update();
	}
	inputGamepads.update();
};

}(window));

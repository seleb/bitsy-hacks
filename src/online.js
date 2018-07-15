/**
🔄
@file online
@summary multiplayer bitsy
@license MIT
@version 1.0.0
@author Sean S. LeBlanc
@description
Provides the groundwork for running a small online multiplayer bitsy game.
Running it requires a signalling server to negotiate connections: https://github.com/seleb/web-rtc-mesh
The actual game data is sent using peer-to-peer data channels, but the server needs
to be up and running in order to make the initial connections.

HOW TO USE:
1. Copy-paste `<script src="https://<your signalling server>/Vertex.js"></script>` after the bitsy source
1. Copy-paste this script into a script tag after that
2. Edit `hackOptions.host` below to point to your server (depending on hosting, you may need to use `ws://` instead of `wss://`)
3. Edit other hackOptions as needed

If `export` is true, an API is provided in `window.online`:
	setSprite(string): updates the player avatar to match the sprite with the provided name/id, then broadcasts an update
	setDialog(string): updates the player dialog to the provided string, then broadcasts an update
	updateSprite(): broadcasts an update
	vertex: reference to the object managing connections

This hack also includes the javascript dialog hack in order to make it easy to
control the multiplayer from inside bitsy. An example of how this can be used is:
(js "online.setSprite('a'); online.setDialog('im a cat');")

Note on dialog: You can use scripting in the dialog, but it will execute on the other players' games,
accessing *their* variables. If you want to send dialog based on data in your game, you have to construct
the dialog string locally, then set it, then send an update.
*/
import bitsy from "bitsy";
import {
	after
} from "./helpers/kitsy-script-toolkit.js";
import "./javascript dialog.js";
import {
	getImage,
	getSpriteData,
	setSpriteData
} from "./helpers/edit image at runtime.js";

var hackOptions = {
	host: "wss://your signalling server",
	immediateMode: true, // if true, teleports players to their reported positions; otherwise, queues movements and lets bitsy handle the walking (note: other players pick up items like this)
	ghosts: false, // if true, sprites from players who disconnected while you were online won't go away until you restart
	export: true, // if true, `window.online` will be set to an object with an API for affecting multiplayer
	disableConsole: true // if true, sets console.log to an empty function (recommended; the logs are pretty spammy)
}

if (hackOptions.disableConsole) {
	console.log = function () {}; //eslint-disable-line
}

if (!window.Vertex) {
	alert("Couldn't connect to server!");
	throw new Error("Couldn't connect to server");
}
var vertex;

// map of dataChannel ids to sprite ids
var peers = new Map(); // eslint-disable-line

after("startExportedGame", function () {
	vertex = new window.Vertex.default({
		host: hackOptions.host,
		onClose: function (event) {
			const p = peers.get(event.target);
			peers.delete(event.target);
			if (!hackOptions.ghosts) {
				delete bitsy.sprite[p];
			}
		},
		onData: function (event) {
			var spr;
			var data = JSON.parse(event.data);
			if (data.from) {
				peers.set(event.target, data.from);
			}
			if (data.e === "move") {
				spr = bitsy.sprite[data.from];
				if (spr) {
					// move sprite
					if (hackOptions.immediateMode) {
						// do it now
						spr.x = data.x;
						spr.y = data.y;
						spr.room = data.room;
					} else {
						// let bitsy handle it later
						spr.walkingPath.push({
							x: data.x,
							y: data.y
						});
					}
				} else {
					// got a move from an unknown player,
					// so ask them who they are
					vertex.send(data.from, {
						e: "gimmeSprite",
						from: vertex.id
					});
				}
			} else if (data.e === "gimmeSprite") {
				// send a sprite update to specific peer
				vertex.send(data.from, getSpriteUpdate());
			} else if (data.e === "sprite") {
				// update a sprite
				var longname = "SPR_" + data.from;
				spr = bitsy.sprite[data.from] = {
					animation: {
						frameCount: data.data.length,
						frameIndex: 0,
						isAnimated: data.data.length > 1
					},
					col: data.col,
					dlg: longname,
					drw: longname,
					inventory: {},
					name: data.from,
					walkingPath: [],
					x: data.x,
					y: data.y,
					room: data.room
				};
				bitsy.dialog[longname] = data.dlg;
				bitsy.imageStore.source[longname] = data.data;

				for (var frame = 0; frame < data.data.length; ++frame) {
					setSpriteData(data.from, frame, data.data[frame]);
				}
			}
		}
	});

	if (hackOptions.export) {
		window.online = {
			vertex: vertex,
			updateSprite: updateSprite,
			setSprite: function (spr) {
				var p = bitsy.player();
				var t = getImage(spr, bitsy.sprite);
				p.animation = {
					frameCount: t.animation.frameCount,
					isAnimated: t.animation.isAnimated,
					frameIndex: 0
				};
				p.col = t.col;
				for (var i = 0; i < p.animation.frameCount; ++i) {
					setSpriteData(bitsy.playerId, i, getSpriteData(spr, i));
				}
				updateSprite();
			},
			setDialog: function (str) {
				bitsy.dialog[bitsy.player().dlg] = str;
				updateSprite();
			}
		};
	}
});

after("movePlayer", moveSprite);
after("onready", function () {
	// tell everyone who you are
	// and ask who they are 1s after starting
	setTimeout(function () {
		if (vertex) {
			updateSprite();
			vertex.broadcast({
				e: "gimmeSprite",
				from: vertex.id
			});
		}
	}, 1000);
});

// tell everyone where you are
function moveSprite() {
	var p = bitsy.player();
	vertex.broadcast({
		e: "move",
		x: p.x,
		y: p.y,
		room: p.room,
		from: vertex.id
	});
}

// tell everyone who you are
function updateSprite() {
	vertex.broadcast(getSpriteUpdate());
}

// helper to create a sprite update based on the player avatar
function getSpriteUpdate() {
	var p = bitsy.player();
	return {
		e: "sprite",
		from: vertex.id,
		data: bitsy.imageStore.source[p.drw],
		x: p.x,
		y: p.y,
		room: p.room,
		dlg: bitsy.dialog[p.dlg],
		col: p.col
	};
}
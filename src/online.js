/**
🔄
@file online
@summary multiplayer bitsy
@license MIT
@version auto
@requires 7.0
@author Sean S. LeBlanc
@description
Provides the groundwork for running a small online multiplayer bitsy game.

Running it requires running a copy of this server: https://github.com/seleb/web-rtc-mesh
Server notes:
	- The actual game data is sent using peer-to-peer data channels;
	the server just hosts client code and negotiates initial connections.
	(i.e. it uses very little bandwidth)
	- A single server can host multiple games simultaneously
	- If you're not sure how to setup/use the server, ask for help!

This hack also includes the hacks for editing images/dialog at runtime through dialog.
This provides the (image), (imageNow), (imagePal), (imagePalNow), and (dialog) commands.
In the online hack, these will automatically trigger a sprite update so that updates to the avatar will be reflected for other players.
See the respective hacks for more info on how to use the commands.

Note on dialog: You can use scripting in the dialog, but it will execute on the other players' games, accessing *their* variables.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit `hackOptions.host` below to point to your server (depending on hosting, you may need to use `ws://` instead of `wss://`)
3. Edit other hackOptions as needed
*/
import bitsy from 'bitsy';
import {
	after,
} from './helpers/kitsy-script-toolkit';
import './javascript dialog';
import {
	setSpriteData,
} from './helpers/edit image at runtime';
import './edit image from dialog';
import './edit dialog from dialog';

export var hackOptions = {
	host: 'wss://your signalling server',
	// room: "custom room", // sets the room on the server to use; otherwise, uses game title
	ghosts: false, // if true, sprites from players who disconnected while you were online won't go away until you restart
	debug: false, // if true, includes web-rtc-mesh debug logs in console
};

// download the client script
// bitsy starts onload, so adding it to the head
// is enough to delay game startup until it's loaded/errored
var clientScript = document.createElement('script');
clientScript.src = hackOptions.host.replace(/^ws/, 'http') + '/client.js';
clientScript.onload = function () {
	console.log('online available!');
};
clientScript.onerror = function (error) {
	console.error('online not available!', error);
};
document.head.appendChild(clientScript);

var client;

function onData(event) {
	var spr;
	var data = event.data;
	switch (data.e) {
	case 'move':
		spr = bitsy.sprite[event.from];
		if (spr) {
			// move sprite
			spr.x = data.x;
			spr.y = data.y;
			spr.room = data.room;
		} else {
			// got a move from an unknown player,
			// so ask them who they are
			client.send(event.from, {
				e: 'gimmeSprite',
			});
		}
		break;
	case 'gimmeSprite':
		// send a sprite update to specific peer
		client.send(event.from, getSpriteUpdate());
		break;
	case 'sprite':
		// update a sprite
		var longname = 'SPR_' + event.from;
		spr = bitsy.sprite[event.from] = {
			animation: {
				frameCount: data.data.length,
				frameIndex: 0,
				isAnimated: data.data.length > 1,
			},
			col: data.col,
			dlg: longname,
			drw: longname,
			inventory: {},
			name: event.from,
			x: data.x,
			y: data.y,
			room: data.room,
		};
		bitsy.dialog[longname] = data.dlg;
		bitsy.renderer.SetImageSource(longname, data.data);

		for (var frame = 0; frame < data.data.length; ++frame) {
			setSpriteData(event.from, frame, data.data[frame]);
		}
		break;
	default:
		break;
	}
}

function onClose(event) {
	if (event.error) {
		console.error('Connection closed due to error:', event.error);
	}

	if (!hackOptions.ghosts) {
		delete bitsy.sprite[event.id];
	}
}

after('startExportedGame', function () {
	if (!window.Client) {
		console.error("Couldn't retrieve client; running game offline");
	}
	var Client = window.Client.default;
	client = new Client({
		host: hackOptions.host,
		room: hackOptions.room || bitsy.title,
	});
	client.on(window.Client.DATA, onData);
	client.on(window.Client.CLOSE, onClose);
	client.setDebug(hackOptions.debug);
});

after('movePlayer', moveSprite);
after('onready', function () {
	// tell everyone who you are
	// and ask who they are 1s after starting
	setTimeout(function () {
		if (client) {
			updateSprite();
			client.broadcast({
				e: 'gimmeSprite',
			});
		}
	}, 1000);
});

// tell everyone where you are
function moveSprite() {
	var p = bitsy.player();
	client.broadcast({
		e: 'move',
		x: p.x,
		y: p.y,
		room: p.room,
	});
}

// tell everyone who you are
function updateSprite() {
	client.broadcast(getSpriteUpdate());
}

// helper to create a sprite update based on the player avatar
function getSpriteUpdate() {
	var p = bitsy.player();
	return {
		e: 'sprite',
		data: bitsy.renderer.GetImageSource(p.drw),
		x: p.x,
		y: p.y,
		room: p.room,
		dlg: bitsy.dialog[p.dlg],
		col: p.col,
	};
}

// trigger sprite updates after these dialog functions
[
	'image',
	'imageNow',
	'imagePal',
	'imagePalNow',
	'dialog',
].forEach(function (tag) {
	var original = bitsy.kitsy.dialogFunctions[tag];
	bitsy.kitsy.dialogFunctions[tag] = function () {
		original.apply(this, arguments);
		updateSprite();
	};
});

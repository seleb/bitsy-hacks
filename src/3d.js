/**
📦
@file 3d
@summary bitsy in three dee
@license MIT
@version 1.0.3
@requires 6.3
@author Sean S. LeBlanc

@description
Re-renders games in 3D instead of 2D.

The 3D rendering is done through babylonjs, a 3D WebGL rendering engine.

Notes:
- The smooth moves hack is included to avoid jerky camera motion when the player moves
- The transparent sprites hack is included with this since most 3D games would need it
  if wanted, you can prevent it from making things transparent by making the isTransparent
  function in the options always return false
- Exit transition effects aren't implemented
- The scene variable is exported, which means it's available at `window.hacks['3d'].scene`
  this is useful for debugging, or in combination with the JS dialog hack
- No camera/mesh collision is included
- The 3D library included is very large by hack filesize standards

The Biggest Note: If you try this out and think "this would be great if only it did X instead of Y",
it probably can with a bit of customization!
Naturally there are dozens of potential ways bitsy could be translated to 3D,
so I focused on covering what I imagined to be some of the most common use cases.
If you need help customizing the hack to achieve a different style, feel free to reach out.

The hackOptions below have relatively thorough documentation,
but make sure to check out https://github.com/seleb/bitsy-hacks/wiki/3D-Hack-Examples 
for examples of different setups if you're new to 3D.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
import './smooth moves';
import {
	after,
	before,
} from './helpers/kitsy-script-toolkit';
import {
	hackOptions as transparentSprites,
} from './transparent sprites';
import 'array-flat-polyfill'; // polyfill array.flat for babylon
import BABYLON from 'babylonjs';
import bitsy from 'bitsy';

export var hackOptions = {
	// Determines the resolution of the scene rendered
	// If auto is true, the width/height will be ignored,
	// and the scene will instead render at 1:1 with the canvas
	// use it if you want it to look crisp on any screen
	// otherwise, I recommend something in the range of 64-512
	size: {
		auto: true,
		width: 128,
		height: 128,
	},
	// If true, inputs are rotated to match the current camera direction
	// if you're using a camera that can be freely rotated,
	// this will generally be preferable,
	// but you may want to disable it for some setups
	// (e.g. a fixed third person camera)
	cameraRelativeMovement: true,
	// If true, left/right inputs are overridden to control 90-degree camera rotations
	// this requires `cameraRelativeMovement: true` to be usable,
	// and it's recommended to not add camera controls if used
	tankControls: false,
	// scene setup
	// a number of helper functions are provided to make this easier
	// but the only necessary thing is to create a camera and assign it to the scene
	init: function (scene) {
		scene.activeCamera = makeBaseCamera(); // creates a camera with some basic presets
		// makeOrthographic(camera, bitsy.mapsize); // makes the camera use orthographic projection (camera, size)
		makeFollowPlayer(scene.activeCamera); // locks the camera to the player
		addControls(scene.activeCamera); // adds rotate/zoom controls (also pan if not following player)
		// addFog(0.5, 1.0); // adds fog in the range (start, end)
		// addShader(`shader source`, 1.0); // adds a post-processing shader (shader source, downscale factor)
	},
	// If true, dialog renders at the top
	// otherwise, renders at the bottom
	// (bitsy's typical position-based rendering doesn't make sense in 3D)
	topDialog: true,
	// Function used in transparent sprites hack
	isTransparent: function (drawing) {
		return !drawing.drw.includes('TIL');
	},
	// Function used to determine how a bitsy drawing is translated into a 3D object
	// available types are:
	// 	- 'plane': plane standing up straight
	// 	- 'billboard': like plane, but turns to look at the camera
	// 	- 'box': standard cube
	// 	- 'floor': plane flat on the ground
	//  - 'tower1', 'tower2', etc: box variations that are taller and tiled
	getType: function (drawing) {
		var drw = drawing.drw;
		if (drawing.id === bitsy.playerId) {
			return 'plane';
		}
		if (drw.startsWith('ITM')) {
			return 'plane';
		}
		if (drw.startsWith('SPR')) {
			return 'billboard';
		}
		if (drawing.isWall) {
			return 'box';
		}
		return 'floor';
	},
	// controls how the 'billboard' type behaves
	// recommendation: the default provided below, or BABYLON.TransformNode.BILLBOARDMODE_ALL
	getBillboardMode: function (BABYLON) {
		return BABYLON.TransformNode.BILLBOARDMODE_Y | BABYLON.TransformNode.BILLBOARDMODE_Z;
	},
	// If true, textures will be preloaded before they're needed while idle
	// it's recommended to keep this on for more consistent performance post-startup
	// (without it, you may notice stutter the first time you enter a room)
	// but if you have a big, highly branching game with lots of art,
	// you may want to disable it
	preloadTextures: true,
};

// forward transparent sprites hack option
transparentSprites.isTransparent = function (drawing) {
	return hackOptions.isTransparent(drawing);
};

// scene init helpers
export function makeBaseCamera() {
	var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 4, bitsy.mapsize / 2, BABYLON.Vector3.Zero(), scene);
	// perspective clipping
	camera.minZ = 0.001;
	camera.maxZ = bitsy.mapsize * 2;
	// zoom
	camera.wheelPrecision = bitsy.mapsize;
	camera.upperRadiusLimit = bitsy.mapsize - 1;
	camera.lowerRadiusLimit = 1;
	return camera;
}
export function makeOrthographic(camera, size) {
	camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
	camera.orthoBottom = -size / 2;
	camera.orthoTop = size / 2;
	camera.orthoLeft = -size / 2;
	camera.orthoRight = size / 2;
	camera.minZ = -size * 2;
	camera.maxZ = size * 2;
	camera.upperRadiusLimit = 0.0001;
	camera.lowerRadiusLimit = 0.0001;
}
export function makeFollowPlayer(camera) {
	var oldUpdate = camera.update;
	camera.update = function () {
		if (playerRef && camera.lockedTarget !== playerRef) {
			camera.lockedTarget = playerRef;
		} else if (!playerRef && camera.lockedTarget) {
			camera.lockedTarget = null;
		}
		oldUpdate.apply(this, arguments);
	};
}
export function addShader(fragmentSrc, downScale) {
	BABYLON.Effect.ShadersStore["customFragmentShader"] = fragmentSrc;

	var postProcess = new BABYLON.PostProcess("customFragmentShader", "custom", ["screenSize"], null, downScale, scene.activeCamera);
	postProcess.onApply = function (effect) {
		effect.setFloat2("screenSize", postProcess.width, postProcess.height);
	};
}
export function addControls(camera) {
	camera.lowerHeightOffsetLimit = 0;
	camera.upperHeightOffsetLimit = bitsy.mapsize / 2;
	camera.upperBetaLimit = Math.PI / 2;
	camera.attachControl(window);
}
export function addFog(start, end) {
	scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
	scene.fogDensity = 1.0;
	scene.fogStart = bitsy.mapsize * start;
	scene.fogEnd = bitsy.mapsize * end;
}

var engine;
export var scene;

var baseMat;
var textCanvas;
var textContext;
var fakeContext = {
	drawImage: function () {},
	fillRect: function () {},
};

// re-initialize the renderer with a scale of 1
// bitsy's upscaling is wasted in 3d
bitsy.renderer = new bitsy.Renderer(bitsy.tilesize, 1);

// prevent dialog box from using position-based rendering
var py;
before('dialogRenderer.DrawTextbox', function () {
	py = bitsy.player().y;
	bitsy.player().y = hackOptions.topDialog ? bitsy.mapsize : 0;
});
after('dialogRenderer.DrawTextbox', function () {
	bitsy.player().y = py;
});

// setup
after('startExportedGame', function () {
	// hide the original canvas and add a stylesheet
	// to make the 3D render in its place
	bitsy.canvas.parentElement.removeChild(bitsy.canvas);
	var style = `
html { font-size: 0; }
canvas { -ms-interpolation-mode: nearest-neighbor; 	image-rendering: -moz-crisp-edges; 	image-rendering: pixelated; }
canvas:focus { outline: none; }
#gameContainer { width: 100vw; max-width: 100vh; margin: auto; }
#gameContainer > * { width: 100%; height: 100%; }
#gameContainer > #textCanvas { margin-top: -100%; background: none; pointer-events: none; }`;
	var sheet = document.createElement('style');
	sheet.textContent = style;
	document.head.appendChild(sheet);

	var gameContainer = document.createElement('div');
	gameContainer.id = 'gameContainer';
	document.body.appendChild(gameContainer);

	var babylonCanvas = document.createElement('canvas');
	babylonCanvas.id = 'babylonCanvas';
	gameContainer.appendChild(babylonCanvas);
	engine = new BABYLON.Engine(babylonCanvas, false); // Generate the BABYLON 3D engine
	// Create the scene space
	scene = new BABYLON.Scene(engine);
	scene.ambientColor = new BABYLON.Color3(1, 1, 1);
	scene.freezeActiveMeshes();

	// create basic resources
	for (var i = 1; i < bitsy.mapsize; ++i) {
		var boxMesh = BABYLON.MeshBuilder.CreateBox('tower' + i, {
			size: 1,
			height: i,
			faceUV: [
				new BABYLON.Vector4(0, 0, 1, i), // "back"
				new BABYLON.Vector4(0, 0, 1, i), // "front"
				new BABYLON.Vector4(0, 0, 1, i), // "right"
				new BABYLON.Vector4(0, 0, 1, i), // "left"
				new BABYLON.Vector4(0, 0, 1, 1), // "top"
				new BABYLON.Vector4(0, 0, 1, 1), // "bottom"
			],
			wrap: true,
		}, scene);
		var uvs = boxMesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
		boxMesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
		boxMesh.isVisible = false;
		boxMesh.doNotSyncBoundingInfo = true;
		boxMesh.position.y = i / 2 - 0.5;
		meshTemplates['tower' + i] = boxMesh;
	}
	meshTemplates.box = meshTemplates.tower1;

	var floorMesh = BABYLON.MeshBuilder.CreatePlane(`floor`, {
		width: 1,
		height: 1,
	}, scene);
	floorMesh.position.y = -0.5;
	floorMesh.rotation.x = Math.PI / 2;
	floorMesh.isVisible = false;
	floorMesh.doNotSyncBoundingInfo = true;
	meshTemplates.floor = floorMesh;

	var planeMesh = BABYLON.MeshBuilder.CreatePlane('plane', {
		width: 1,
		height: 1,
		sideOrientation: BABYLON.Mesh.DOUBLESIDE,
		frontUVs: new BABYLON.Vector4(0, 1, 1, 0),
		backUVs: new BABYLON.Vector4(0, 1, 1, 0),
	}, scene);
	planeMesh.rotation.x = Math.PI;
	planeMesh.isVisible = false;
	meshTemplates.plane = planeMesh;
	planeMesh.doNotSyncBoundingInfo = true;
	meshTemplates.billboard = planeMesh.clone('billboard');

	baseMat = new BABYLON.StandardMaterial('base material', scene);
	baseMat.ambientColor = new BABYLON.Color3(1, 1, 1);
	baseMat.maxSimultaneousLights = 0;
	baseMat.freeze();

	hackOptions.init(scene);

	textCanvas = document.createElement('canvas');
	textCanvas.id = 'textCanvas';
	textCanvas.width = bitsy.canvas.width;
	textCanvas.height = bitsy.canvas.height;
	gameContainer.appendChild(textCanvas);
	textContext = textCanvas.getContext('2d');
	bitsy.dialogRenderer.AttachContext(textContext);

	// Watch for browser/canvas resize events
	engine.setSize(hackOptions.size.width, hackOptions.size.height);
	if (hackOptions.size.auto) {
		engine.resize();
		window.addEventListener("resize", function () {
			engine.resize();
		});
	}

	// fill the texture cache using idle callbacks
	// to reduce perf issues
	if (hackOptions.preloadTextures) {
		Object.values(bitsy.room).forEach(function (room) {
			var items = room.items.map(function (item) {
				return bitsy.item[item.id];
			});
			var tiles = room.tilemap.flat().filter(function (tile) {
				return tile !== '0';
			}).map(function (tile) {
				return bitsy.tile[tile];
			});
			var sprites = Object.values(bitsy.sprite).filter(function (sprite) {
				return sprite.room === room.id;
			});
			[].concat(items, tiles, sprites).forEach(function (drawing) {
				requestIdleCallback(function () {
					var f = drawing.animation.frameIndex;
					for (var i = 0; i < drawing.animation.frameCount; ++i) {
						drawing.animation.frameIndex = i;
						getTexture(drawing, room.pal);
					}
					drawing.animation.frameIndex = f;
				})
			});
		});
	}
});

// input stuff
var rotationTable = {};
rotationTable[bitsy.Direction.Up] = bitsy.Direction.Left;
rotationTable[bitsy.Direction.Left] = bitsy.Direction.Down;
rotationTable[bitsy.Direction.Down] = bitsy.Direction.Right;
rotationTable[bitsy.Direction.Right] = bitsy.Direction.Up;
rotationTable[bitsy.Direction.None] = bitsy.Direction.None;

function rotate(direction) {
	var rotatedDirection = direction;
	var ray = scene.activeCamera.getForwardRay().direction;
	var ray2 = new BABYLON.Vector2(ray.x, ray.z);
	ray2.normalize();
	var a = (Math.atan2(ray2.y, ray2.x) / Math.PI + 1) * 2 + 0.5;
	if (a < 0) {
		a += 4;
	}
	for (var i = 0; i < a; ++i) {
		rotatedDirection = rotationTable[rotatedDirection];
	}
	return rotatedDirection;
}

var rawDirection = bitsy.Direction.None;
var tankTarget = 0;
var tankFrom = 0;
var tankTime = 0;
before('movePlayer', function () {
	rawDirection = bitsy.curPlayerDirection;
	if (hackOptions.tankControls) {
		if (rawDirection === bitsy.Direction.Left) {
			tankTime = bitsy.prevTime;
			tankFrom = tankTarget;
			tankTarget += Math.PI / 2;
		} else if (rawDirection === bitsy.Direction.Right) {
			tankTime = bitsy.prevTime;
			tankFrom = tankTarget;
			tankTarget -= Math.PI / 2;
		}
	}
	if (hackOptions.cameraRelativeMovement) {
		bitsy.curPlayerDirection = rotate(rawDirection);
	}
	if (tankTime === bitsy.prevTime) {
		bitsy.curPlayerDirection = bitsy.Direction.None;
	}
});
after('movePlayer', function () {
	bitsy.curPlayerDirection = rawDirection;
});

// loop stuff
var dialogDirty = false;
var prevRoom;
after('update', function () {
	if (prevRoom !== bitsy.curRoom) {
		scene.blockMaterialDirtyMechanism = true;
		scene.blockfreeActiveMeshesAndRenderingGroups = true;
	}
	update();
	if (hackOptions.tankControls) {
		scene.activeCamera.alpha = tankFrom + (tankTarget - tankFrom) * (1.0 - Math.pow(1.0 - Math.min((bitsy.prevTime - tankTime) / 200, 1), 2.0));
	}
	if (prevRoom !== bitsy.curRoom) {
		scene.blockMaterialDirtyMechanism = false;
		scene.blockfreeActiveMeshesAndRenderingGroups = false;
		prevRoom = bitsy.curRoom;
	}

	// clear out the text context when not in use
	if (!bitsy.dialogBuffer.IsActive()) {
		if (dialogDirty) {
			textContext.clearRect(0, 0, textCanvas.width, textCanvas.height);
			dialogDirty = false;
		}
	} else {
		dialogDirty = true;
	}
});

// replace 2d rendering with 3d rendering
before('drawRoom', function (room, context, frameIndex) {
	// note: player movement has to happen here
	// in order to be compatible with smooth moves
	if (playerRef && prevRoom === bitsy.curRoom) {
		playerRef.position.x = bitsy.player().x;
		playerRef.position.z = bitsy.mapsize - bitsy.player().y;
	}
	return [room, fakeContext, frameIndex];
});
after('update', function () {
	// clear scene when rendering title/endings
	// using a FOV hack here instead of the engine's clear function
	// in order to ensure post-processing isn't overridden
	var fov = scene.activeCamera.fov;
	if (bitsy.isNarrating || bitsy.isEnding) {
		scene.activeCamera.fov = 0;
	}
	scene.render();
	scene.activeCamera.fov = fov;
});

// cache helper
function getCache(make) {
	var cache = {};
	return function (id, args) {
		var cached = cache[id];
		if (cached) {
			return cached;
		}
		cached = cache[id] = make.apply(undefined, args);
		return cached;
	};
}

var getTextureFromCache = getCache(function (drawing, pal) {
	var c = bitsy.renderer.GetImage(drawing, pal);
	// mock tile draw with palette shenanigans
	// to force transparency to take effect
	var p = bitsy.getRoomPal(bitsy.player().room);
	bitsy.room[bitsy.player().room].pal = pal;
	bitsy.drawTile(c, 0, 0, fakeContext);
	bitsy.room[bitsy.player().room].pal = p;

	var tex = new BABYLON.DynamicTexture('test', {
		width: c.width,
		height: c.height,
	}, scene, false, BABYLON.Texture.NEAREST_NEAREST_MIPNEAREST);
	tex.wrapU = tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
	if (hackOptions.isTransparent(drawing)) {
		tex.hasAlpha = true;
	}
	var ctx = tex.getContext();
	ctx.drawImage(c, 0, 0);
	tex.update();
	return tex;
});

function getTexture(drawing, pal) {
	var drw = drawing.drw;
	var col = drawing.col;
	var frame = drawing.animation.frameIndex;
	var key = `${drw},${col},${pal},${frame}`;
	return getTextureFromCache(key, [drawing, pal]);
}

var getMaterialFromCache = getCache(function (drawing, pal) {
	var mat = baseMat.clone();
	mat.diffuseTexture = getTexture(drawing, pal);
	mat.freeze();
	return mat;
});

function getMaterial(drawing, pal) {
	var drw = drawing.drw;
	var col = drawing.col;
	var frame = drawing.animation.frameIndex;
	var key = `${drw},${col},${pal},${frame}`;
	return getMaterialFromCache(key, [drawing, pal]);
}

var meshTemplates = {};
var getMeshFromCache = getCache(function (drawing, pal, type) {
	var mesh = meshTemplates[type].clone();
	mesh.makeGeometryUnique();
	mesh.isVisible = false;
	mesh.material = getMaterial(drawing, pal);
	return mesh;
});

function getMesh(drawing, pal) {
	var drw = drawing.drw;
	var col = drawing.col;
	var frame = drawing.animation.frameIndex;
	var key = `${drw},${col},${pal},${frame}`;
	return getMeshFromCache(key, [drawing, pal, hackOptions.getType(drawing)]);
}

var playerRef;
var playerMovement = {
	name: 'player-movement',
	init: function () {},
	attach: function (target) {
		playerRef = target;
	},
	detach: function () {
		playerRef = null;
	},
};

function applyBehaviours(target) {
	var isPlayer = target.name === 'player';
	if (isPlayer) {
		target.addBehavior(playerMovement);
	}
	if (target.sourceMesh.source.name === 'billboard') {
		target.billboardMode = hackOptions.getBillboardMode(BABYLON);
	} else if (!isPlayer) {
		target.freezeWorldMatrix();
	}
}

var sprites = {};
var items = {};
var tiles = [];
for (var y = 0; y < bitsy.mapsize; ++y) {
	var row = [];
	for (var x = 0; x < bitsy.mapsize; ++x) {
		row.push(['-1', null]);
	}
	tiles.push(row);
}

function update() {
	// sprite changes
	Object.entries(sprites).forEach(function (entry) {
		if (bitsy.sprite[entry[0]].room !== bitsy.curRoom) {
			entry[1].dispose();
			entry[1] = null;
			delete sprites[entry[0]];
		}
	});
	Object.values(bitsy.sprite).filter(function (sprite) {
		return sprite.room === bitsy.curRoom;
	}).forEach(function (sprite) {
		var id = sprite.id;
		var oldMesh = sprites[id];
		var newMesh = getMesh(sprite, bitsy.curPal());
		if (newMesh !== (oldMesh && oldMesh.sourceMesh)) {
			if (oldMesh) {
				oldMesh.dispose();
			}
			newMesh = newMesh.createInstance();
			newMesh.position.x = sprite.x;
			newMesh.position.z = bitsy.mapsize - sprite.y;

			if (id === bitsy.playerId) {
				newMesh.name = 'player';
			}
			applyBehaviours(newMesh);
			sprites[id] = oldMesh = newMesh;
		}
	});
	// item changes
	Object.entries(items).forEach(function (entry) {
		if (!bitsy.room[bitsy.curRoom].items.find(function (item) {
				return `${item.id},${item.x},${item.y}` === entry[0];
			})) {
			entry[1].dispose();
			entry[1] = null;
			delete items[entry[0]];
		}
	});
	bitsy.room[bitsy.curRoom].items.forEach(function (roomItem) {
		var key = `${roomItem.id},${roomItem.x},${roomItem.y}`;
		var item = bitsy.item[roomItem.id];
		var oldMesh = items[key];
		var newMesh = getMesh(item, bitsy.curPal());
		if (newMesh !== (oldMesh && oldMesh.sourceMesh)) {
			if (oldMesh) {
				oldMesh.dispose();
			}
			newMesh = newMesh.createInstance();
			newMesh.position.x = roomItem.x;
			newMesh.position.z = bitsy.mapsize - roomItem.y;
			applyBehaviours(newMesh);
			items[key] = newMesh;
		}
	});

	// tile changes
	var tilemap = bitsy.room[bitsy.curRoom].tilemap;
	for (var y = 0; y < tilemap.length; ++y) {
		var row = tilemap[y];
		for (var x = 0; x < row.length; ++x) {
			var roomTile = row[x];
			var tile = tiles[y][x];
			tile[0] = roomTile;
			var oldMesh = tile[1];
			if (roomTile === '0') {
				if (oldMesh) {
					oldMesh.dispose();
				}
				tile[1] = null;
				continue;
			}
			var newMesh = getMesh(bitsy.tile[roomTile], bitsy.curPal());
			if (newMesh === (oldMesh && oldMesh.sourceMesh)) {
				continue;
			}
			newMesh = newMesh.createInstance();
			newMesh.position.x = x;
			newMesh.position.z = bitsy.mapsize - y;
			applyBehaviours(newMesh);
			if (oldMesh) {
				oldMesh.dispose();
			}
			tile[1] = newMesh;
		}
	}

	// bg changes
	scene.clearColor = getBgColor();
	scene.fogColor = getBgColor();
}

function getBgColor() {
	var col = bitsy.palette[bitsy.curPal()].colors[0];
	return new BABYLON.Color3(
		col[0] / 255,
		col[1] / 255,
		col[2] / 255
	);
}

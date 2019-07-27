/**
📦
@file 3d
@summary bitsy in three dee
@license MIT
@version 1.2.0
@requires 6.3
@author Sean S. LeBlanc & Elkie Nova

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

additional features to help make more fancy 3d scenes from bitsy editor:
* make arcs, bridges, ceilings, multiple floors, and such by layering
bitsy rooms on top of each other. add tag-function '#stack(stackId,position)'
to the names of the rooms you want to render together
for example you can have rooms named 'theater #stack(a,0)', 'stage #stack(a,1)' and
'catwalks #stack(a,4)' and they will be displayed at the same time, the 'stage'
right on top of the 'theater', and 'catwalks' three tiles higher than the
'stage'
'stackId' should only include letters (no numbers and special characters
please), it specifies the room stack.
rooms in the same stack will be rendered on top of each others, in layers.
'position' is the hight at which you want to display a
specific room. you can use negative numbers and floating points too, like
'#stack(fjk,-3.5)'
note that two rooms in the same stack can be positioned at the same height
(useful for layering drawings themselves right on top of each other to make
use of more colors and other nifty workarounds)

* specify the mesh to use for a specific drawing by appending its name with '#mesh(type)'
there are following mesh types available:
	- plane: plane standing up straight
	- billboard: like plane, but turns to look at the camera
	- box: standard cube
	- floor: plane flat on the ground
	- tower1, tower2, up to tower16: box variations that are taller and tiled
	- wedge: base mesh for wedges, facing left with its slanted side
	- empty: use this one to make the drawings invisible
you can have drawings with the names like this using this tag:
'sign #mesh(plane)', 'water #mesh(floor)'
don't forget that you can combine '#mesh(type)' with transform tags

* transform tags: translate (move), rotate and scale by adding tags to the drawing's name
useful for making more complex shapes and more organic silhouettes by shifting
models a bit off the grid, and configuring plane-type meshes to face a specific direction
#t(x,y,z) for translation, #r(x,y,z) for rotation (in degrees), #s(x,y,z) for scaling.
#t(1,0,0.5') and '#t(1,,.5)' are both examples of valid input
omiting the number is the same as writing 0. note that this won't change anything on
the given axis for rotation and translation, but it will for scaling

* add #transparent(true)/#transparent(false) tag to the drawing's name to set
transparency manually. sprites and items are transparent by default, and tiles are not

* '#children(TYPE-id, TYPE-id, ...)' tag can be used to combine drawings together.
add it to the name of the drawing, like this:
'combo-grass #children(tile-a, tile-b, tile-c, tile-d)'
'very tall person #children(sprite-a, sprite-b)'
'multi-colored avatar #children(tile-f, tile-g)'
TYPE specifies whether the drawing is a tile, an item or a sprite, and id is a group of characters
that uniquely identifies the drawing among other drawings of this type.
you can check the id of the drawing in game data or in 'paint' and 'find drawing' panels
in the bitsy editor when the name of the drawing is blank.
to quickly check the id of the drawing that already has a name,
you can just select and cut the name and then paste it back again.
the drawing that has this tag will become a parent, and the drawings specified inside the tag will
become its children - that means they will move together with the parent,
their transforms (position, rotation and scale) will be affected by the transform of the parent
(keep that in mind when using transform tags!), and when the parent is deleted so are its children.
this tag is helpful for using more colors on one drawing (together with transparent tag),
to make more complex objects by combining basic meshes (with transform tag),
and it also works on the avatar, which is useful because multi-sprite avatar hack
is not fully compatible with 3d hack.
note, that although avatar's name isn't displayed in 'paint' and 'find drawing' panels,
you can specify it and add tags to it in the game data directly.
you can search for 'SPR A' and add 'NAME <whatever you want to be here>' on the next line
after the lines with ones and zeroes.
notes:
	* for child drawings to display animations correctly, the parent drawing must have
	at least the same number of frames as the child drawing with most frames
	e.g. if you add 'sprite b' as a child and it has 2 frames, the parent drawing should also have 2 frames
	even if you don't need animation on the parent drawing, make sure to enable animation on it
	(or duplicate its frames in the game data if any of its children has more than 2 frames).
	* type of drawing is inferred from just the first letter. TYPE and id can be separated by
	hyphen, underscore or space. you can have 's-a' instead of 'sprite-a', or 'SPR a' as it goes by in game data.
	you can pick a naming style that suits you best in terms of clarity and conciseness
	* child drawings only have the visual aspect, they don't have any gameplay properties.
	the tile with the 'wall' property checked won't actually block the path when added as a child,
	items won't get picked up and sprites won't start the dialog.
	* drawings added as children can't be parents.

check this out to learn how to work with wedges conveniently in the bitsy editor:
https://github.com/aloelazoe/bitsy-hacks/wiki/how-to-use-wedges-with-3d-hack-and-replace-drawing-hack

here is a template with 12 pre-configured wedge drawings you can use with 3d hack and replace drawing hack:
https://gist.github.com/aloelazoe/9d02711a649d241d1e78f8d5e4beb9d7

if you have questions, suggestions or constructive feedback about additional features
introduced in my fork, feel free to reach out on bitsy discord or twitter (aloelazoe)

enjoy have fun with verticality triangularity and whatnot!!!
✧*[๑⌒ ᴗ ⌒๑]✧*

HOW TO USE:
1. Copy-paste the contents of this file into a script tag after the bitsy source
2. Add the tags described above to the names of the rooms and drawings in bitsy editor to use additional features
3. Edit hackOptions below as needed
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
		var name = drawing.name || '';
		var match = name.match(/#transparent\(((true)|(false))\)/);
		if (match) {
			// 2nd capturing group reserved for 'true' will be undefined if the input said 'false'
			return Boolean(match[2]);
		}
		return !drawing.drw.includes('TIL');
	},
	// Function used to determine how a bitsy drawing is translated into a 3D object
	// available types are:
	// 	- 'plane': plane standing up straight
	// 	- 'billboard': like plane, but turns to look at the camera
	// 	- 'box': standard cube
	// 	- 'floor': plane flat on the ground
	// 	- 'tower1', 'tower2', etc: box variations that are taller and tiled
	// 	- 'wedge': base mesh for wedges, facing left with its slanted side
	// 	- 'empty': base mesh for wedges, facing left with its slanted side
	getType: function (drawing) {
		var drw = drawing.drw;
		var name = drawing.name || '';

		// match the drawing's name against the regular expression
		// that describes #mesh(type) tag
		var meshMatch = name.match(/#mesh\((.+?)\)/);
		if (meshMatch) {
			if (meshTemplates[meshMatch[1]]) {
				return meshMatch[1];
			} else {
				// if the specified mesh template doesn't exist,
				// display error message, but continue execution
				// to resolve the mesh with default logic
				console.error(`mesh template '${meshMatch[1]}' wasn't found`);
			}
		}

		// default
		if (drawing.id === bitsy.playerId) {
			return 'billboard';
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

	// function used to adjust mesh instances after they have been added to the scene
	meshExtraSetup: function (drawing, mesh) {
		var name = drawing.name || '';

		// transform tags. #t(x,y,z): translate (move), #r(x,y,z): rotate, #s(x,y,z): scale
		// #m(1,0,0.5) and #m(1,,.5) are both examples of valid input
		// scale
		var scaleTag = name.match(/#s\((-?\.?\d*\.?\d*)?,(-?\.?\d*\.?\d*)?,(-?\.?\d*\.?\d*)?\)/);
		if (scaleTag) {
			mesh.scaling = new BABYLON.Vector3(
				Number(scaleTag[1]) || 0,
				Number(scaleTag[2]) || 0,
				Number(scaleTag[3]) || 0
			);
		}
		// rotate. input in degrees
		var rotateTag = name.match(/#r\((-?\.?\d*\.?\d*)?,(-?\.?\d*\.?\d*)?,(-?\.?\d*\.?\d*)?\)/);
		if (rotateTag) {
			mesh.rotation.x += radians(Number(rotateTag[1]) || 0);
			mesh.rotation.y += radians(Number(rotateTag[2]) || 0);
			mesh.rotation.z += radians(Number(rotateTag[3]) || 0);
		}
		// translate (move)
		var translateTag = name.match(/#t\((-?\.?\d*\.?\d*)?,(-?\.?\d*\.?\d*)?,(-?\.?\d*\.?\d*)?\)/);
		if (translateTag) {
			mesh.position.x += (Number(translateTag[1]) || 0);
			mesh.position.y += (Number(translateTag[2]) || 0);
			mesh.position.z += (Number(translateTag[3]) || 0);
		}

		// children tag
		// for now for animation to work gotta make sure that the parent drawing has as many frames as children
		var childrenTag;
		// make sure the mesh we are about to add children to doesn't have a parent on its own to avoid ifinite loops
		// maybe add checking for parents of parents recursively up to a certain number to allow more complex combinations
		if (!mesh.parent) {
			childrenTag = name.match(/#children\(([\w-, ]+)\)/);
		}
		if (childrenTag) {
			// parse args and get the actual drawings
			var children = childrenTag[1].split(/, |,/).map(function(arg) {
				if (arg) {
					var type, id, map;
					[type, id] = arg.split(/[ _-]/);
					if (type && id) {
						switch (type[0].toLowerCase()) {
							case 't':
								map = bitsy.tile;
								break;
							case 'i':
								map = bitsy.item;
								break;
							case 's':
								map = bitsy.sprite;
						}
						if (map) {
							return map[id];
						}
					}
				}
			}).filter(Boolean);

			// add specified drawings to the scene as child meshes
			children.forEach(function(childDrawing) {
				var childMesh = getMesh(childDrawing, bitsy.curPal());
				childMesh = childMesh.createInstance();
				childMesh.position.x = mesh.position.x;
				childMesh.position.y = mesh.position.y;
				childMesh.position.z = mesh.position.z;
				mesh.addChild(childMesh);
				applyBehaviours(childMesh, childDrawing);
				// make sure children can move if they are parented to the avatar
				if (drawing = bitsy.player()) {
					childMesh.unfreezeWorldMatrix();
				}
			});
		}
	},
};

function radians(degrees) {
	return degrees * Math.PI / 180;
}

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
	// replace playerRef with playerPosNode to fix billboard crash
	camera.update = function () {
		if (playerPosNode && camera.lockedTarget !== playerPosNode) {
			camera.lockedTarget = playerPosNode;
		} else if (!playerPosNode && camera.lockedTarget) {
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
	// box and towers
	for (var i = 1; i <= bitsy.mapsize; ++i) {
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
		// adjust template position so that the instances will be displated correctly
		transformGeometry(boxMesh, BABYLON.Matrix.Translation(0.0, i / 2 - 0.5, 0.0));
		meshTemplates['tower' + i] = boxMesh;
	}
	meshTemplates.box = meshTemplates.tower1;

	// floor
	var floorMesh = BABYLON.MeshBuilder.CreatePlane(`floor`, {
		width: 1,
		height: 1,
	}, scene);
	// adjust template position so that the instances will be displated correctly
	transformGeometry(floorMesh, BABYLON.Matrix.Translation(0.0, 0.0, 0.5));
	// have to transform geometry instead of using regular rotation
	// or it will mess up children transforms when using combine tag
	transformGeometry(floorMesh, BABYLON.Matrix.RotationX(Math.PI/2));
	floorMesh.isVisible = false;
	floorMesh.doNotSyncBoundingInfo = true;
	meshTemplates.floor = floorMesh;

	// plane
	var planeMesh = BABYLON.MeshBuilder.CreatePlane('plane', {
		width: 1,
		height: 1,
		sideOrientation: BABYLON.Mesh.DOUBLESIDE,
		frontUVs: new BABYLON.Vector4(0, 1, 1, 0),
		backUVs: new BABYLON.Vector4(0, 1, 1, 0),
	}, scene);
	// in case of rotation have to transform geometry or it will affect positions of its children
	transformGeometry(planeMesh, BABYLON.Matrix.RotationX(Math.PI));
	planeMesh.isVisible = false;
	meshTemplates.plane = planeMesh;
	planeMesh.doNotSyncBoundingInfo = true;
	meshTemplates.billboard = planeMesh.clone('billboard');

	// wedge
	var wedgeMesh = new BABYLON.Mesh("wedgeMesh", scene);
	var wedgeMeshPos = [
		-1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, -1, 0, 1, 0, 1, 1, // 0,1,2, 3,4,5,
		-1, 0, 1, -1, 0, 0, 0, 1, 0, 0, 1, 1, // 6,7,8,9
		0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, // 10,11,12,13
		0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 1 // 14,15,16,17
	];
	var wedgeMeshInd = [
		0, 1, 2, 3, 4, 5, //triangles on the front and the back
		6, 7, 8, 8, 9, 6, // tris that make up the sliding face at the top
		10, 11, 12, 12, 13, 10, // right face
		14, 15, 16, 16, 17, 14 // bottom face
	];
	var wedgeMeshUvs = [
		0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1,
		0, 0, 1, 0, 1, 1, 0, 1,
		0, 0, 1, 0, 1, 1, 0, 1,
		0, 0, 1, 0, 1, 1, 0, 1
	];
	var wedgeMeshVertData = new BABYLON.VertexData();
	wedgeMeshVertData.positions = wedgeMeshPos;
	wedgeMeshVertData.indices = wedgeMeshInd;
	wedgeMeshVertData.uvs = wedgeMeshUvs;

	var translation = BABYLON.Matrix.Translation(0.5, -0.5, -0.5);
	wedgeMeshVertData.transform(translation);

	wedgeMeshVertData.applyToMesh(wedgeMesh);
	wedgeMesh.isVisible = false; // but newly created copies and instances will be visible by default
	wedgeMesh.doNotSyncBoundingInfo = true;

	meshTemplates.wedge = wedgeMesh;

	// empty mesh for making drawings invisible
	var emptyMesh = new BABYLON.Mesh("emptyMesh", scene);
	meshTemplates.empty = emptyMesh;

	// add transform node for playerPosNode that's going to copy avatar's position so that the
	// camera can follow them without crashing when the avatar is rendered as billboard
	playerPosNode = new BABYLON.TransformNode("playerPosNode");

	// material
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

	// register room stacks here
	Object.values(bitsy.room).forEach(function (room) {
		var name = room.name || '';
		var stackId = '-' + room.id + '-';
		var stackPos = 0;
		var tag = name.match(/#stack\(([a-zA-Z]+),(-?\.?\d*\.?\d*)\)/);
		if (tag) {
			stackId = tag[1];
			stackPos = Number(tag[2]) || 0;
		}
		roomsInStack[stackId] = roomsInStack[stackId] || []
		roomsInStack[stackId].push(room.id);

		stackPosOfRoom[room.id] = {
			stack: stackId,
			pos: stackPos,
		};
	});

	// create tile arrays for stacks
	// entry[0] is stackId, entry[1] is an array of roomsIds in the stack
	Object.entries(roomsInStack).forEach(function (entry) {
		tilesInStack[entry[0]] = makeTilesArray(entry[1].length);
	});

	// preload textures
	// safari, edge and ie don't support requestIdleCallback
	// TODO: add requestIdleCallback shim
	if (hackOptions.preloadTextures && window.hasOwnProperty('requestIdleCallback')) {
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
				});
			});
		});
	}
});

// to adjust vertices on the mesh
function transformGeometry(mesh, matrix) {
	var vertData = BABYLON.VertexData.ExtractFromMesh(mesh);
	vertData.transform(matrix);
	vertData.applyToMesh(mesh);
}

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
		// make sure playerPosNode moves with the player so that the camera can
		// use it as a target to prevent crashing whith billboard-avatar
		playerPosNode.position = playerRef.position;
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
	tex.wrapU = tex.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
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
	// enable vertical tiling for towers
	if (type.startsWith('tower')) {
		mesh.material.diffuseTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
	}
	return mesh;
});

function getMesh(drawing, pal) {
	var type = hackOptions.getType(drawing);
	var drw = drawing.drw;
	var col = drawing.col;
	var frame = drawing.animation.frameIndex;
	// include type in the key to account for cases when drawings that link to
	// the same 'drw' need to have different types when using with other hacks
	var key = `${drw},${col},${pal},${frame},${type}`;
	return getMeshFromCache(key, [drawing, pal, type]);
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
// camera target that will follow the player to fix billboard avatar
var playerPosNode;

function applyBehaviours(targetMesh, drawing) {
	hackOptions.meshExtraSetup(drawing, targetMesh);
	var isPlayer = targetMesh.name === 'player';
	if (isPlayer) {
		targetMesh.addBehavior(playerMovement);
	}
	if (targetMesh.sourceMesh.source.name === 'billboard') {
		targetMesh.billboardMode = hackOptions.getBillboardMode(BABYLON);
	} else if (!isPlayer) {
		targetMesh.freezeWorldMatrix();
	}
}

// room stacks stuff
var roomsInStack = {};
var stackPosOfRoom = {};

var lastStack;
var curStack;

var lastRoom;

var tilesInStack = {};

var sprites = {};
var items = {};

function makeTilesArray(stackSize) {
	var a = [];
	for (var y = 0; y < bitsy.mapsize; ++y) {
		var row = [];
		for (var x = 0; x < bitsy.mapsize; ++x) {
			var coln = [];
			for (var z = 0; z < stackSize; ++z) {
				coln.push(['-1', null]);
			}
			row.push(coln);
		}
		a.push(row);
	}
	return a;
}

function update() {
	// console.log("update called");
	curStack = stackPosOfRoom[bitsy.curRoom].stack;

	// sprite changes
	Object.entries(sprites).forEach(function (entry) {
		if (stackPosOfRoom[bitsy.sprite[entry[0]].room].stack !== curStack) {
			entry[1].dispose();
			entry[1] = null;
			delete sprites[entry[0]];
		}
	});
	Object.values(bitsy.sprite).filter(function (sprite) {
		// make sure 'stackPosOfRoom[sprite.room]' is defined to account for cases when
		// the sprites refer to deleted rooms
		return stackPosOfRoom[sprite.room] && stackPosOfRoom[sprite.room].stack === curStack;
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
			newMesh.position.y = stackPosOfRoom[sprite.room].pos;
			if (id === bitsy.playerId) {
				newMesh.name = 'player';
			}
			applyBehaviours(newMesh, sprite);
			sprites[id] = oldMesh = newMesh;
		}
	});
	// make sure the avatar is rendered at the correct height
	// when they enter new rooms in the stack
	if (lastRoom && lastRoom !== bitsy.curRoom) {
		sprites[bitsy.playerId].position.y = stackPosOfRoom[bitsy.curRoom].pos;
	}

	// item changes
	// delete irrelevant items
	Object.entries(items).forEach(function (entry) {
		var roomId = entry[0].slice(0, entry[0].indexOf(','));
		if (stackPosOfRoom[roomId].stack === curStack) {
			// if this item in current stack
			// check if it is still listed its room
			// if so keep it as it is and return
			if (bitsy.room[roomId].items.find(function (item) {
					return `${roomId},${item.id},${item.x},${item.y}` === entry[0];
				})) {
				return;
			}
		}
		// if this item is not in the current stack
		// or in the current stack but was picked up or stolen by demons
		entry[1].dispose();
		entry[1] = null;
		delete items[entry[0]];
	});

	// make/update relevant items
	roomsInStack[curStack].forEach(function (roomId) {
		bitsy.room[roomId].items.forEach(function (roomItem) {
			var key = `${roomId},${roomItem.id},${roomItem.x},${roomItem.y}`;
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
				newMesh.position.y = stackPosOfRoom[roomId].pos;
				applyBehaviours(newMesh, item);
				items[key] = newMesh;
			}
		});
	});

	// tile changes
	// check if we entered a new stack
	// if so make sure tiles from the old stack aren't visible
	if (lastStack && lastStack !== curStack) {
		tilesInStack[lastStack].forEach(function (row) {
			row.forEach(function (coln) {
				coln.forEach(function (tileEntry) {
					if (tileEntry[1] !== null) {
						tileEntry[1].dispose();
						tileEntry[1] = null;
					}
				});
			});
		});
	}

	roomsInStack[curStack].forEach(function (roomId, roomIdIndex) {
		var tilemap = bitsy.room[roomId].tilemap;
		for (var y = 0; y < tilemap.length; ++y) {
			var row = tilemap[y];
			for (var x = 0; x < row.length; ++x) {
				var roomTile = row[x];
				var tile = tilesInStack[curStack][y][x][roomIdIndex];
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
				newMesh.position.y = stackPosOfRoom[roomId].pos;
				applyBehaviours(newMesh, bitsy.tile[roomTile]);
				if (oldMesh) {
					oldMesh.dispose();
				}
				tile[1] = newMesh;
			}
		}
	});

	// bg changes
	scene.clearColor = getBgColor();
	scene.fogColor = getBgColor();

	// remember what stack we were in in this frame
	lastStack = curStack;
	lastRoom = bitsy.curRoom;
}

function getBgColor() {
	var col = bitsy.palette[bitsy.curPal()].colors[0];
	return new BABYLON.Color3(
		col[0] / 255,
		col[1] / 255,
		col[2] / 255
	);
}

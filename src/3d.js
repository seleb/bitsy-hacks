/**
📦
@file 3d
@summary bitsy in three dee
@license MIT
@version 1.0.3
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
bitsy rooms on top of each other. add #tags to the names of the rooms
you want to render together
for example you can have rooms named 'theater #a0', 'stage #a1' and
'catwalks #a4' and they will be displayd together, the 'stage'
right on top of the 'theater', and 'catwalks' three tiles higher than the
'stage'
tags should be in this format: '#fjk12' where '#' comes first,
then 'fjk' is the string of letters (no numbers and special characters
please) of any length specifying the room stack.
(rooms in the same stack will be rendered on top of each others, in layers)
and '12' is the hight at which you want to display a
specific room. you can use negative numbers and floating points too like
'#fjk-3.5' (the size of one bitsy tile is 1)

* use wedges to add variety to your scene with stuff like slopes
and diagonal walls. add the tag to the drawing's name if you want it to
be displayed in the ⊿ wedge-form ⊿
for example:
'#wdg2s' stands for ceiling wedge facing south (with its slanted side)
'#wdg1nw' for wall wedge facing north-west (with its slanted side)
0/1/2 stands for the floor/wall/ceiling wedge.
then to specify direction n/e/s/w for a floor/ceiling wedge,
and se/sw/nw/ne for a wall wedge
make sure to read about the next feature that allows for convinient
use of wedges from the bitsy editor!!!

* repalce drawings with other drawings before they are rendered in 3d
by appending their names with the tag in this format:
'#draw_TIL_a'
where TIL/SPR/ITM is followed by the drawing's id (exactly how you can see it
in bitsy game data panel. id is a combination of letters and numbers that follows
'TIL' 'SPR' or 'ITM' like avatar is 'SPR A' in bitsy data and 'A' is the id)
'#drawTILa' also works
this is very useful for making gizmo-like drawings that can look different in
bitsy editor and when rendered in 3d.
12 variations of wedges can be confusing to work with in bitsy editor, 
if you can't tell how exactly each wedge is facing based on its drawing.
with this tag you can have useful descriptive drawings for wedges rotated
in different directions and then specify drawings you want to use as
actual textures when rendering your wedges in 3d
here is a temaplate game data chunk with 12 wedge gizmos that are going to use
'TIL a' (as it is called in bitsy data) as their texture in 3d instead of their original drawings
https://gist.github.com/aloelazoe/f1a3b998362a7160cbd74ac31135296a
just paste it into you game data to use in your bitsy game (add, don't replace existing data)
or open it in the text editor first and search-replace '#drawTILa'
to set another drawing you would like to use as a texture on wedges
if you have a big project with lots of drawings make sure to check that wedges ids
don't overlap with the ids of the drawings you already have

* move, rotate and scale by adding tags to the drawing's name
useful for making more complex shapes and more organic silhouettes by shifting
models a bit off the grid, and configuring plane-type meshes to face a specific direction
#m(x,y,z) for moving, #r(x,y,z) for rotation (in degrees), #s(x,y,z) for scaling.
#m(1,0,0.5') and '#m(1,,.5)' are both examples of valid input
omiting the number is the same as writing 0 for rotation and movement and 1 for scaling
i.e. it won't change anything on the given axis

* add '#invisible' to the drawing name and it won't be added to the scene,
useful for making invisible walls

if you have questions, suggestions or constructive feedback about these additional features
introduced in my fork, feel free to reach out on bitsy discord or twitter (aloelazoe)

enjoy have fun with verticality triangularity and whatnot!!!
✧*[๑⌒ ᴗ ⌒๑]✧*

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
	// should be true if you want to use '#draw_SPR_a' kind of tags to replace drawings
	// used for wedge gizmos
	replaceDrawingTag: true,
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
		return !drawing.drw.includes('TIL') || name.includes('#transparent');
	},
	// Function used to determine how a bitsy drawing is translated into a 3D object
	// available types are:
	// 	- 'plane': plane standing up straight
	// 	- 'billboard': like plane, but turns to look at the camera
	// 	- 'box': standard cube
	// 	- 'floor': plane flat on the ground
	//  - 'tower1', 'tower2', etc: box variations that are taller and tiled
    //  - 'wedgeFloor': base mesh for wedges, facing left with its slanted side
	getType: function (drawing) {
		var drw = drawing.drw;
		var name = drawing.name || '';
		// specific
		if (name.includes('#invisible')) {
			return null;
		}
		if (name.includes('#box')) {
			return 'box';
		}
		if (name.includes('#wdg')) {
            return 'wedgeFloor';
        }
        if (name.includes('#floor')) {
            return 'floor';
        }
        if (name.includes('#plane')) {
            return 'plane';
        }
        // towers
        var twrMatch = name.match(/#twr([0-9]+)/)
        if (twrMatch) {
        	var i = Number(twrMatch[1]);
        	return `tower${1 <= i && i <= bitsy.mapsize ? i : 1}`;
        }

		// player
		if (drawing.id === bitsy.playerId) {
			return 'billboard';
		}

		// general
		if (drw.startsWith('ITM')) {
			return 'billboard';
		}
		if (drw.startsWith('SPR') || name.includes('#board')) {
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

        // transform tags. #m(x,y,z): move, #r(x,y,z): rotate, #s(x,y,z): scale
        // #m(1,0,0.5) and #m(1,,.5) are both examples of valid input
        // scale
        var scaleTag = name.match(/#s\((-?[\.?\d+]\.?\d*)?,(-?[\.?\d+]\.?\d*)?,(-?[\.?\d+]\.?\d*)?\)/);
        if (scaleTag) {
            mesh.scaling = new BABYLON.Vector3(Number(scaleTag[1]) || 1,
                                               Number(scaleTag[2]) || 1,
                                               Number(scaleTag[3]) || 1);
        }
        // rotate. input in degrees
        var rotateTag = name.match(/#r\((-?[\.?\d+]\.?\d*)?,(-?[\.?\d+]\.?\d*)?,(-?[\.?\d+]\.?\d*)?\)/);
        if (rotateTag) {
            mesh.rotation.x += radians(Number(rotateTag[1]) || 0);
            mesh.rotation.y += radians(Number(rotateTag[2]) || 0);
            mesh.rotation.z += radians(Number(rotateTag[3]) || 0);
        }
        // move
        var moveTag = name.match(/#m\((-?[\.?\d+]\.?\d*)?,(-?[\.?\d+]\.?\d*)?,(-?[\.?\d+]\.?\d*)?\)/);
        if (moveTag) {
            mesh.position.x += (Number(moveTag[1]) || 0);
            mesh.position.y += (Number(moveTag[2]) || 0);
            mesh.position.z += (Number(moveTag[3]) || 0);
        }

        // position wedges
        var wdgTag = name.match(/#wdg([02](?=([nesw]))|1(?=([sn][ew])))/);
        if (wdgTag) {
        	// 1st capturing group returns wedge type
        	var type = wdgTag[1];
        	// either 2nd or 3rd capturing group was returned, it determines direction
        	var direction = wdgTag[2] || wdgTag[3];
        	if (type === '1') {
        		// adjust wall wedges
                mesh.rotation.x += -Math.PI/2;
                switch (direction) {
                    // 'sw' is default direction for wall wedges
                    case 'se':
                        mesh.rotation.y += Math.PI/2*3;
                        break;
                    case 'nw':
                        mesh.rotation.y += Math.PI/2;
                        break;
                    case 'ne':
                        mesh.rotation.y += Math.PI;
                        break;
                }
        	} else {
        		// floor and ceiling wedges
                if (type === '2') {
                	// adjust ceiling wedges
                    mesh.rotation.x += Math.PI;
                }
                switch (direction) {
                    // 'w' is default direction for floor and celing wedges
                    case 's':
                        mesh.rotation.y += Math.PI/2*3;
                        break;
                    case 'e':
                        mesh.rotation.y += Math.PI;
                        break;
                    case 'n':
                        mesh.rotation.y += Math.PI/2;
                        break;
                }
        	}
        }

        // and you can add more stuff like this!
    },
};

function radians(degrees) {
  return degrees * Math.PI / 180;
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
	// replace playerRef with copyCat to fix billboard crash
	camera.update = function () {
		if (copyCat && camera.lockedTarget !== copyCat) {
			camera.lockedTarget = copyCat;
		} else if (!copyCat && camera.lockedTarget) {
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
		// won't work cause i'm setting y position for instances later
		// boxMesh.position.y = i / 2 - 0.5;
		transformGeometry(boxMesh, BABYLON.Matrix.Translation(0.0, i / 2 - 0.5, 0.0));
		meshTemplates['tower' + i] = boxMesh;
	}
	meshTemplates.box = meshTemplates.tower1;

	// floor
	var floorMesh = BABYLON.MeshBuilder.CreatePlane(`floor`, {
		width: 1,
		height: 1,
	}, scene);
	// won't work cause i'm setting y position for instances
	// floorMesh.position.y = -0.5;
	// babylon's pivot points also don't work for some reason [~ _ ~]
	// so i would have to modify geometry i guess
    // or maybe add to values instead of setting them when positioning instances idk
	transformGeometry(floorMesh, BABYLON.Matrix.Translation(0.0,0.0,0.5));
	floorMesh.rotation.x = Math.PI / 2;
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
	planeMesh.rotation.x = Math.PI;
    // transformGeometry(planeMesh, BABYLON.Matrix.RotationAxis(
	planeMesh.isVisible = false;
	meshTemplates.plane = planeMesh;
	planeMesh.doNotSyncBoundingInfo = true;
	meshTemplates.billboard = planeMesh.clone('billboard');

	 // ✨magical wedges here✨
    var wedgeFloorMesh = new BABYLON.Mesh("wedgeFloorMesh", scene);
    var wedgeFloorMeshPos = [-1,0,0, 0,0,0, 0,1,0,   0,0,1, -1,0,1, 0,1,1, // 0,1,2, 3,4,5,
                      -1,0,1, -1,0,0, 0,1,0, 0,1,1, // 6,7,8,9
                      0,0,0, 0,0,1, 0,1,1, 0,1,0, // 10,11,12,13
                      0,0,1, 0,0,0, -1,0,0, -1,0,1 // 14,15,16,17
                      ];
    var wedgeFloorMeshInd = [0,1,2, 3,4,5, //triangles on the front and the back
                      6,7,8, 8,9,6, // tris that make up the sliding face at the top
                      10,11,12, 12,13,10, // right face
                      14,15,16, 16,17,14  // bottom face
                      ];
    var wedgeFloorMeshUvs = [0,0, 1,0, 1,1,   0,0, 1,0, 0,1,
                      0,0, 1,0, 1,1, 0,1,
                      0,0, 1,0, 1,1, 0,1,
                      0,0, 1,0, 1,1, 0,1
                      ];
    var wedgeFloorMeshVertData = new BABYLON.VertexData();
    wedgeFloorMeshVertData.positions = wedgeFloorMeshPos;
    wedgeFloorMeshVertData.indices = wedgeFloorMeshInd;
    wedgeFloorMeshVertData.uvs = wedgeFloorMeshUvs;

    var translation = BABYLON.Matrix.Translation(0.5,-0.5,-0.5);
    wedgeFloorMeshVertData.transform(translation);
    
    wedgeFloorMeshVertData.applyToMesh(wedgeFloorMesh);
    wedgeFloorMesh.isVisible = false; // but newly created copies or instances will be visible by default
    wedgeFloorMesh.doNotSyncBoundingInfo = true;

    meshTemplates.wedgeFloor = wedgeFloorMesh;

    // add transform node for copyCat that's going to copy avatar's position so that the
    // camera can follow them without crashing when the avatar is rendered as billboard
    copyCat = new BABYLON.TransformNode("copyCat");

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
		var tag = name.match(/#([a-zA-Z]+)(-?[0-9]+\.?[0-9]*)/);
		if (tag) {
			stackId = tag[1];
			stackPos = Number(tag[2]);
		}
		if (!roomsInStack.hasOwnProperty(stackId)) {
			roomsInStack[stackId] = [];
		}
		roomsInStack[stackId].push(room.id);

		stackPosOfRoom[room.id] = {};
		stackPosOfRoom[room.id].stack = stackId;
		stackPosOfRoom[room.id].pos = stackPos;
	});

	// console.log("bitsy.room");
	// console.log(bitsy.room);

	// console.log("stackPosOfRoom");
	// console.log(stackPosOfRoom);

	// console.log("roomsInStack");
	// console.log(roomsInStack);

	// create tile arrays for stacks
	// entry[0] is stackId, entry[1] is an array of roomsIds in the stack
	Object.entries(roomsInStack).forEach(function (entry) {
		tilesInStack[entry[0]] = makeTilesArray (entry[1].length);
	});

	// console.log("tilesInStack");
	// console.log(tilesInStack);

    // iterate through all drawings 
	// fill the texture cache using idle callbacks
	// to reduce perf issues
	// swap drawings for editor gizmos here
	// mb later add category for drawing setup tags that woulnd need to be handled here
	// and check if there are any tags registred in the list for this category
	// for now just add hackOptions.replaceDrawingTag for #draw_SPR/TIL/ITM_id
	// #draw_SPR_A
	if (hackOptions.preloadTextures || hackOptions.replaceDrawingTag) {
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
				// replace drawings marked with the #draw tag
				if (hackOptions.replaceDrawingTag) {
					var name = drawing.name || '';
					var tag = name.match(/#draw[- _]?(TIL|SPR|ITM)[- _]?([a-zA-Z0-9]+)/);
					if (tag) {
						// console.log(tag);
						var map;
						// tag[1] is the first capturing group, it can be either TIL, SPR, or ITM
						switch (tag[1]) {
							case 'TIL':
								map = bitsy.tile;
								break;
							case 'SPR':
								map = bitsy.sprite;
								break;
							case 'ITM':
								map = bitsy.item;
								break;
						}
						// tag[2] is the second capturing group which returns drawing id
						var id = tag[2];
						drawing.drw = map[id].drw;
						drawing.animation.frameCount = map[id].animation.frameCount;
						drawing.animation.isAnimated = map[id].animation.isAnimated;
						drawing.col = map[id].col;
					}
				}
				// preload textures
				// safari, edge and ie don't support requestIdleCallback. make sure to check
				// or it will throw an error and won't run this function on other drawings
				// and #draw tags won't have any effect
				if (hackOptions.preloadTextures && window.hasOwnProperty('requestIdleCallback')) {
					requestIdleCallback(function () {
						var f = drawing.animation.frameIndex;
						for (var i = 0; i < drawing.animation.frameCount; ++i) {
							drawing.animation.frameIndex = i;
							getTexture(drawing, room.pal);
						}
						drawing.animation.frameIndex = f;
					})
				}
			});
		});
	}
});

// to conveniently adjust meshes cause pivot points don't work or they work in some really counterintuitive way
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
		// mew i'm gonna copy their position mew
		copyCat.position = playerRef.position;
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
	// for invisible tag
	var type = hackOptions.getType(drawing);
	if (!type) {
		return null;
	}
	var drw = drawing.drw;
	var col = drawing.col;
	var frame = drawing.animation.frameIndex;
	// include type in the key to account for cases when drawings that link to
	// the same 'drw' need to have different types, like wedge gizmos
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
var copyCat;

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

// room stacks stuff
var roomsInStack = {};
var stackPosOfRoom = {};

var lastStack;
var curStack;

var lastRoom;

var tilesInStack = {};

var sprites = {};
var items = {};

function makeTilesArray (stackSize) {
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
		// plz be nice to your sprites
        // if (!stackPosOfRoom[sprite.room]) {
        //     console.log(`hiya i'm SPR ${sprite.id} aka ${sprite.name} imma break ur game cause u deleted my room 🗡\\[｡Ծ _ Ծ｡]/🔪`);
        // }
        // return stackPosOfRoom[sprite.room].stack === curStack;
		return stackPosOfRoom[sprite.room] && stackPosOfRoom[sprite.room].stack === curStack;
	}).forEach(function (sprite) {
		var id = sprite.id;
		var oldMesh = sprites[id];
		var newMesh = getMesh(sprite, bitsy.curPal());
		// consider newMesh being null as a result of invisible tag
		if (newMesh && newMesh !== (oldMesh && oldMesh.sourceMesh)) {
			if (oldMesh) {
				oldMesh.dispose();
			}
			newMesh = newMesh.createInstance();
			newMesh.position.x = sprite.x;
			newMesh.position.z = bitsy.mapsize - sprite.y;
			newMesh.position.y = stackPosOfRoom[sprite.room].pos;
			hackOptions.meshExtraSetup(sprite, newMesh);

			if (id === bitsy.playerId) {
				newMesh.name = 'player';
			}
			applyBehaviours(newMesh);
			sprites[id] = oldMesh = newMesh;
		}
	});
	// make sure the avatar is rendered at the correct height
	// when they enter new rooms in the stack
	if (lastRoom && lastRoom !== bitsy.curRoom) {
		sprites[bitsy.playerId].position.y = stackPosOfRoom[bitsy.curRoom].pos;
	}


	// item changes
	// with stacks: add room id to the key also check if it's in the curStack
	// comment out old code and rewrite loops from scratch

	// ok try again
	// delete irrelevant items
	// var t1 = performance.now();
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
		// good by item ღ•᷄_•᷄)ノ
		entry[1].dispose();
		entry[1] = null;
		delete items[entry[0]];
	});
	// var t2 = performance.now();
	// console.log(`it took ${t2-t1} ms to delete irrelevant items`);

	// make/update relevant items
	// t1 = performance.now();
	roomsInStack[curStack].forEach(function (roomId) {
		bitsy.room[roomId].items.forEach(function (roomItem) {
			var key = `${roomId},${roomItem.id},${roomItem.x},${roomItem.y}`;
			var item = bitsy.item[roomItem.id];
			var oldMesh = items[key];
			var newMesh = getMesh(item, bitsy.curPal());
			// consider newMesh being null as a result of invisible tag
			if (newMesh && newMesh !== (oldMesh && oldMesh.sourceMesh)) {
				if (oldMesh) {
					oldMesh.dispose();
				}
				newMesh = newMesh.createInstance();
				newMesh.position.x = roomItem.x;
				newMesh.position.z = bitsy.mapsize - roomItem.y;
				newMesh.position.y = stackPosOfRoom[roomId].pos;
				hackOptions.meshExtraSetup(item, newMesh);
				applyBehaviours(newMesh);
				items[key] = newMesh;
			}
		});
	});
	// t2 = performance.now();
	// console.log(`it took ${t2-t1} ms to make/update relevant items`);
	// YAY I DID IT FINALLY IT WORKS OMG

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
				// consider newMesh being null as a result of invisible tag
				if (!newMesh || newMesh === (oldMesh && oldMesh.sourceMesh)) {
					continue;
				}
				newMesh = newMesh.createInstance();
				newMesh.position.x = x;
				newMesh.position.z = bitsy.mapsize - y;
				newMesh.position.y = stackPosOfRoom[roomId].pos;
				hackOptions.meshExtraSetup(bitsy.tile[roomTile], newMesh);
				applyBehaviours(newMesh);
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

/**
😴
@file canvas replacement
@summary WebGLazy bitsy integration (this one's mostly just for me)
@license MIT
@version 2.1.0
@author Sean S. LeBlanc

@description
Replaces bitsy canvas with a responsive WebGL canvas (this one's mostly just for me)

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. For finer scaling, edit `var text_scale = 2` and `var scale = 4` in the bitsy source to `var text_scale = 1` and `var scale = 2`
3. Edit the hackOptions object passed to the `new WebGLazy` call as needed

The shader used to render the canvas can be overriden by including script tags
with `id='shader-frag'` and `type='x-shader/x-fragment'
e.g.
<script id='shader-frag' type='x-shader/x-fragment'>
	// uv-wave fragment shader
	precision mediump float;
	uniform sampler2D tex0;
	uniform sampler2D tex1;
	uniform float time;
	uniform vec2 resolution;

	void main(){
		vec2 coord = gl_FragCoord.xy;
		vec2 uv = coord.xy / resolution.xy;
		uv.x += sin(uv.y * 10.0 + time / 200.0) / 60.0;
		uv.y += cos(uv.x * 10.0 + time / 200.0) / 60.0;
		vec3 col = texture2D(tex0,uv).rgb;
		gl_FragColor = vec4(col, 1.0);
	}
(closing script tag omitted in comment to avoid confusing browser)
*/
import WebGLazy from "webglazy";
import {
	after
} from "./helpers/kitsy-script-toolkit";

export var hackOptions = {
	glazyOptions: {
		background: "black",
		scaleMode: "MULTIPLES", // use "FIT" if you prefer size to pixel accuracy
		allowDownscaling: true,
		disableFeedbackTexture: true, // set this to false if you want to use the feedback texture
	},
	init: function(glazy) {
		// you can set up any custom uniforms you have here if needed
		// e.g. glazy.glLocations.myUniform = glazy.gl.getUniformLocation(glazy.shader.program, 'myUniform');
	},
	update: function(glazy) {
		// you can update any custom uniforms you have here if needed
		// e.g. glazy.gl.uniform1f(glazy.glLocations.myUniform, 0);
	},
};

var glazy;
after('startExportedGame', function () {
	glazy = new WebGLazy(hackOptions.glazyOptions);
	hackOptions.init(glazy);
});

after('update', function () {
	hackOptions.update(glazy);
});

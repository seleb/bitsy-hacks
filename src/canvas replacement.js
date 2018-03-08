/*
bitsy hack - canvas replacement

Replaces bitsy canvas with a responsive WebGL canvas (this one's mostly just for me).

This isn't a self-contained hack; it relies on https://github.com/seleb/WebGLazy
to replace the canvas, and this is simply the code needed to integrate for bitsy.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. For finer scaling, edit `var text_scale = 2` and `var scale = 4` in the bitsy source to `var text_scale = 1` and `var scale = 2`
3. Edit the options object passed to the `new WebGLazy` call as needed

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
import bitsy from "bitsy";
import {WebGLazy} from "webglazy";

var glazy;
var _startExportedGame = bitsy.startExportedGame;
bitsy.startExportedGame = function () {
	if (_startExportedGame) {
		_startExportedGame();
	}
	glazy = new WebGLazy({
		background: 'black',
		scaleMode: WebGLazy.SCALE_MODES.MULTIPLES, // use WebGLazy.SCALE_MODES.FIT if you prefer size to pixel accuracy
		allowDownscaling: true,
		disableFeedbackTexture: true // set this to false if you want to use the feedback texture
	});
	// you can set up any custom uniforms you have here if needed
	// e.g. glazy.glLocations.myUniform = glazy.gl.getUniformLocation(glazy.shader.program, 'myUniform');
}
var _update = bitsy.update;
bitsy.update = function () {
	if (_update) {
		_update();
	}
	// you can update any custom uniforms you have here if needed
	// e.g. glazy.gl.uniform1f(glazy.glLocations.myUniform, 0);
}
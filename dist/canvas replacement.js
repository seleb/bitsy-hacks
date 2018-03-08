/*
bitsy hack - canvas replacement

Replaces bitsy canvas with a responsive WebGL canvas (this one's mostly just for me).

This isn't a self-contained hack; it relies on https://github.com/seleb/WebGLazy
to replace the canvas, and this is simply the code needed to integrate for bitsy.

HOW TO USE:
1. Copy https://github.com/seleb/WebGLazy/blob/master/WebGLazy.min.js into your game. You can either:
	- copy the contents into a script tag in the head
	- copy the file next to your html file and add a script tag with `src="WebGLazy.min.js"` to the head
2. Copy-paste this script into a script tag after the bitsy source
3. For better scaling, edit `var text_scale = 2` and `var scale = 4` in the bitsy source to `var text_scale = 1` and `var scale = 2`

The shaders used to render the canvas can be overriden by including script tags
with `type='x-shader/x-fragment' and `id='shader-vert'` or `id='shader-frag'`
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
</script>
*/
(function () {
'use strict';


var glazy;
var _startExportedGame = startExportedGame;
startExportedGame = function () {
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
};
var _update = update;
update = function () {
	if (_update) {
		_update();
	}
	// you can update any custom uniforms you have here if needed
	// e.g. glazy.gl.uniform1f(glazy.glLocations.myUniform, 0);
};

}());

import bitsy from "bitsy";
import {
	hackOptions as canvasReplacementHackOptions,
	glazy
} from "./canvas replacement";

var room;

var hackOptions = {
	duration: 1000,
	checkTransition: function () {
		var r = bitsy.curRoom;
		if (room !== r) {
			// room changed between frames
			room = r;
			return true;
		}
		return false;
	},
	// glsl snippet which defines the rendered output of the transition
	transition: 'result = mix(start, end, t);',
};

canvasReplacementHackOptions.disableFeedbackTexture = false;
canvasReplacementHackOptions.init = function () {
	room = bitsy.curRoom;
	glazy.glLocations.transitionTime = glazy.gl.getUniformLocation(glazy.shader.program, 'transitionTime');

	// hack textureFeedback update
	// so we can update it as-needed rather than every frame
	glazy.textureFeedback.oldUpdate = glazy.textureFeedback.update;
	glazy.textureFeedback.update = function () {};
};
canvasReplacementHackOptions.update = function () {
	if (hackOptions.checkTransition()) {
		// transition occurred; update feedback texture to capture frame
		glazy.gl.uniform1f(glazy.glLocations.transitionTime, glazy.curTime);
		glazy.textureFeedback.oldUpdate();
	}
};

var shader = document.createElement("script");

shader.id = "shader-frag";
shader.type = "x-shader/x-fragment";
shader.textContent = `
	precision mediump float;
	uniform sampler2D tex0;
	uniform sampler2D tex1;
	uniform float time;
	uniform float transitionTime;
	uniform vec2 resolution;

	void main(){
		vec2 coord = gl_FragCoord.xy;
		vec2 uv = coord.xy / resolution.xy;
		vec3 end = texture2D(tex0,uv).rgb;
		vec3 start = texture2D(tex1,uv).rgb;
		vec3 result;
		float t = clamp((time-transitionTime)/float(${hackOptions.duration}), 0.0, 1.0);
		${hackOptions.transition}
		gl_FragColor = vec4(result, 1.0);
	}
`;
document.head.appendChild(shader);

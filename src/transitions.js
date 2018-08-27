import bitsy from "bitsy";
import {
	hackOptions,
	glazy
} from "./canvas replacement";
var room;
hackOptions.disableFeedbackTexture = false;
hackOptions.init = function() {
	room = bitsy.curRoom;

	// hack textureFeedback update
	// so we can update it as-needed rather than every frame
	glazy.textureFeedback.oldUpdate = glazy.textureFeedback.update;
	glazy.textureFeedback.update = function(){};
};
hackOptions.update = function() {
	// check for transition
	var r = bitsy.curRoom;
	if (room !== r) {
		// transition occurred; update feedback texture to capture frame
		room = r;
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
	uniform vec2 resolution;

	void main(){
		vec2 coord = gl_FragCoord.xy;
		vec2 uv = coord.xy / resolution.xy;
		vec3 col = texture2D(tex0,uv).rgb;
		gl_FragColor = vec4(col, 1.0);
	}
`;
document.head.appendChild(shader);

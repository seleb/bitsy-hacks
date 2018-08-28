/**
🎞
@file transitions
@summary customizable WebGL transitions
@license MIT
@version 1.0.0
@author Sean S. LeBlanc

@description
Adds a simple system for defining fancy transitions.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit the transition hackOptions below as needed

NOTES:
- Includes canvas replacement hack
- Available in shader snippet:
	result:  vec3 - rendered output (assign to this)
	 start:  vec3 - output at start of transition
	   end:  vec3 - output at end of transition
	    uv:  vec2 - uv coordinates for output
	     t: float - transition time (0-1)
	  rand: float(vec2) - function returning a random value (0-1) based on an input vec2
	  tex0:   sampler2D - sampler for end
	  tex1:   sampler2D - sampler for start
	(see shader source below for more detail if needed)
- Example shader snippets:
	    fade: result = mix(start, end, t);
	ltr wipe: result = mix(start, end, step(uv.x, t));
	 iris in: result = mix(start, end, step(distance(uv, vec2(0.5))/sqrt(0.5), t));
	squash up:
		vec2 eUv = uv/vec2(1.0,t);
		end = texture2D(tex0, eUv).rgb;
		result = mix(start, end, step(uv.y,t));
	noisy pixels:
		float sPix = max(1.0, floor(256.0*pow(max(0.0, 0.5-t)*2.0,2.0)));
		float ePix = max(1.0, floor(256.0*pow(max(0.0, t-0.5)*2.0,2.0)));
		vec2 sUv = floor(uv*sPix + 0.5)/sPix;
		vec2 eUv = floor(uv*ePix + 0.5)/ePix;
		end = texture2D(tex0, eUv).rgb;
		start = texture2D(tex1, sUv).rgb;
		end += mix(rand(eUv+vec2(t)), 0.0, t);
		start += mix(0.0, rand(sUv-vec2(t)), t);
		result = mix(start, end, step(.5,t));
*/
import bitsy from "bitsy";
import {
	hackOptions as canvasReplacementHackOptions,
	glazy
} from "./canvas replacement";

var hackOptions = {
	// transition duration
	duration: 1000,
	// function which defines when a transition occured
	// return true to indicate a transition; false otherwise
	// example implementation is transition on room change
	checkTransition: function () {
		var r = bitsy.curRoom;
		if (this.room !== r) {
			// room changed between frames
			this.room = r;
			return true;
		}
		return false;
	},
	// glsl snippet which defines the rendered output of the transition
	transition: 'result = mix(start, end, t);',
};

canvasReplacementHackOptions.disableFeedbackTexture = false;
canvasReplacementHackOptions.init = function () {
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

	// https://stackoverflow.com/questions/12964279/whats-the-origin-of-this-glsl-rand-one-liner
	float rand(vec2 co){
		return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
	}

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

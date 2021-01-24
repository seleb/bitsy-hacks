/**
🎞
@file transitions
@summary customizable WebGL transitions
@license MIT
@version 15.4.1
@author Sean S. LeBlanc

@description
Adds a simple system for defining fancy transitions.

The transition effect is customizable as a GLSL snippet,
and the transition trigger is customizable as a basic function
returning either `true` or `false`.

The most obvious use (and example implementation)
is to create transitions between room changes,
but the transition function can be defined as anything.
e.g. you could transition every time the player moves,
when they pick up a specific item, after an arbitrary timeout, etc.

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
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions$1 = {
	// transition duration
	duration: 1000,
	// whether to transition title screen
	includeTitle: true,
	// function which defines when a transition occurred
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
	// options forwarded to canvas replacement
	glazyOptions: {},
};

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

bitsy = bitsy || /*#__PURE__*/_interopDefaultLegacy(bitsy);

function t(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function e(t,e){for(var i=0;i<e.length;i++){var s=e[i];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(t,s.key,s);}}function i(t,i,s){return i&&e(t.prototype,i),s&&e(t,s),t}function s(t){if(!s.context&&(s.context=t.getContext("webgl")||t.getContext("experimental-webgl"),!s.context))throw "No WebGL support";return s.context}var n=function(){function e(i,n){t(this,e),this.gl=new s,this.vertSource=i,this.fragSource=n,this.program=this.gl.createProgram();try{this.vertShader=this.compileShader(this.vertSource,this.gl.VERTEX_SHADER),this.fragShader=this.compileShader(this.fragSource,this.gl.FRAGMENT_SHADER);}catch(t){throw this.gl.deleteProgram(this.program),delete this.program,console.error("Couldn't create shader: ",t),t}this.gl.attachShader(this.program,this.vertShader),this.gl.deleteShader(this.vertShader),delete this.vertShader,this.gl.attachShader(this.program,this.fragShader),this.gl.deleteShader(this.fragShader),delete this.fragShader,this.gl.linkProgram(this.program);}return i(e,[{key:"compileShader",value:function(t,e){try{var i=this.gl.createShader(e);if(this.gl.shaderSource(i,t),this.gl.compileShader(i),!this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS))throw this.gl.getShaderInfoLog(i);return i}catch(i){throw console.error("Couldn't compile shader (".concat(e,"): "),t,i),i}}},{key:"useProgram",value:function(){this.gl.useProgram(this.program);}}]),e}(),o=function(){function e(i,n,o){t(this,e),this.gl=new s,this.source=i,this.texture=this.gl.createTexture(),this.bind(n),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,this.source),this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,!0),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,o?this.gl.NEAREST:this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,o?this.gl.NEAREST:this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.bindTexture(this.gl.TEXTURE_2D,null);}return i(e,[{key:"update",value:function(){this.bind(),this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,!0),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,this.source),this.gl.bindTexture(this.gl.TEXTURE_2D,null);}},{key:"bind",value:function(t){var e=t||this.lastBoundId||0;this.gl.activeTexture(this.gl.TEXTURE0+e),this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture),this.lastBoundId=e;}}]),e}(),r=function(){function e(i){var s=this,n=i.source,o=i.sources,r=void 0===o?["canvas","video","img"]:o,a=i.hideSource,h=void 0===a||a,c=i.background,l=void 0===c?"black":c,u=i.scaleMultiplier,d=void 0===u?1:u,g=i.scaleMode,m=void 0===g?e.SCALE_MODES.FIT:g,v=i.allowDownscaling,f=void 0!==v&&v,p=i.timestep,E=void 0===p?1/60*1e3:p,T=i.disableFeedbackTexture,b=void 0!==T&&T,x=i.disableMouseEvents,y=void 0!==x&&x,w=i.pixelate,S=void 0===w||w,L=i.autoInit,_=void 0===L||L,A=i.vertex,R=void 0===A?"// default vertex shader\nattribute vec4 position;\nvoid main() {\n\tgl_Position = position;\n}":A,M=i.fragment,C=void 0===M?"// default fragment shader\nprecision mediump float;\nuniform sampler2D tex0;\nuniform sampler2D tex1;\nuniform vec2 resolution;\n\nvoid main() {\n\tvec2 coord = gl_FragCoord.xy;\n\tvec2 uv = coord.xy / resolution.xy;\n\tgl_FragColor = vec4(texture2D(tex0, uv).rgb, 1.0);\n}":M;t(this,e),this.main=function(t){s.lastTime=s.curTime,s.curTime=(t||s.now())-s.startTime,s.deltaTime=s.curTime-s.lastTime,s.accumulator+=s.deltaTime,s.accumulator>s.timestep&&(s.render(),s.accumulator-=s.timestep),s.requestAnimationFrame(s.main);},this.sources=r,this.source=n||this.getSource(),this.hideSource=h,this.background=l,this.scaleMultiplier=d,this._scale=d,this.scaleMode=m,this.allowDownscaling=f,this.timestep=E,this.disableFeedbackTexture=!!b,this.disableMouseEvents=!!y,this.pixelate=S,this.vertex=R,this.fragment=C,_&&this.init();}return i(e,[{key:"getSource",value:function(){var t,e=[];for(t=0;t<this.sources.length;++t)e.push(Array.prototype.slice.call(document.getElementsByTagName(this.sources[t])));if(0===(e=Array.prototype.concat.apply([],e)).length)throw "Couldn't find an element from "+this.sources+" to use as a source";return e[0]}},{key:"insertStylesheet",value:function(){this.style=document.createElement("style"),document.head.appendChild(this.style),this.style.innerHTML="\nhtml,body,div#canvasContainer{\n\tpadding:0;\n\tmargin:0;\n\n\twidth:100%;\n\theight:100%;\n\n\ttop:0;\n\tleft:0;\n\tright:0;\n\tbottom:0;\n\n\tbackground: ".concat(this.background,";\n\tcolor:#FFFFFF;\n\n\toverflow:hidden;\n\n\t").concat(this.hideSource?"visibility: hidden!important;":"","\n}\n\ncanvas#outputCanvas{\n").concat(this.pixelate?"\n\timage-rendering: optimizeSpeed;\n\timage-rendering: -webkit-crisp-edges;\n\timage-rendering: -moz-crisp-edges;\n\timage-rendering: -o-crisp-edges; \n\timage-rendering: crisp-edges;\n\timage-rendering: -webkit-optimize-contrast;\n\timage-rendering: optimize-contrast;\n\timage-rendering: pixelated;\n\t-ms-interpolation-mode: nearest-neighbor;\n":"","\n\n\tposition:absolute;\n\tmargin:auto;\n\ttop:0;\n\tleft:-1000%;\n\tright:-1000%;\n\tbottom:0;\n\n\t\t\t").concat(this.hideSource?" visibility: visible!important;":"","\n\t\t\t").concat(this.scaleMode===this.constructor.SCALE_MODES.MULTIPLES?"\n\ttransition:\n\t\twidth  0.2s cubic-bezier(0.22, 1.84, 0.88, 0.77),\n\t\theight 0.2s cubic-bezier(0.22, 1.84, 0.88, 0.77);":"","\n};");}},{key:"init",value:function(){this.size={x:this.source.width||this.source.style.width,y:this.source.height||this.source.style.height},this.size.x*=this.scaleMultiplier||1,this.size.y*=this.scaleMultiplier||1,this.ratio=this.size.x/this.size.y,this.insertStylesheet(),this.canvasContainer=document.createElement("div"),this.canvasContainer.id="canvasContainer",this.allowDownscaling||(this.canvasContainer.style.minWidth=this.size.x+"px",this.canvasContainer.style.minHeight=this.size.y+"px"),this.canvas=document.createElement("canvas"),this.canvas.id="outputCanvas",this.canvas.width=this.size.x,this.canvas.height=this.size.y,this.canvas.style.width=this.canvas.style.height=0,this.canvasContainer.appendChild(this.canvas),document.body.appendChild(this.canvasContainer);try{this.gl=new s(this.canvas),this.render=this.renderGL;}catch(t){console.warn("Falling back to canvas rendering: ",t),this.render=this.renderCanvas,this.canvas2d=this.canvas.getContext("2d");}this.gl&&(this.shader=new n(this.vertex,this.fragment),this.vertices=new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),this.vertexBuffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vertexBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,this.vertices,this.gl.STATIC_DRAW),this.textureSource=new o(this.source,0,this.pixelate),this.disableFeedbackTexture||(this.textureFeedback=new o(this.canvas,1,this.pixelate)),this.glLocations={position:this.gl.getAttribLocation(this.shader.program,"position"),tex0:this.gl.getUniformLocation(this.shader.program,"tex0"),tex1:this.gl.getUniformLocation(this.shader.program,"tex1"),time:this.gl.getUniformLocation(this.shader.program,"time"),resolution:this.gl.getUniformLocation(this.shader.program,"resolution")},this.gl.enableVertexAttribArray(this.glLocations.position),this.gl.viewport(0,0,this.size.x,this.size.y),this.shader.useProgram(),this.gl.vertexAttribPointer(this.glLocations.position,2,this.gl.FLOAT,!1,0,0),this.gl.clearColor(0,0,0,1),this.gl.uniform1i(this.glLocations.tex0,0),this.gl.uniform1i(this.glLocations.tex1,1),this.gl.uniform2f(this.glLocations.resolution,this.size.x,this.size.y)),window.onresize=this.onResize.bind(this),window.onresize(),this.disableMouseEvents||(this.canvas.onmousedown=this.onMouseEvent.bind(this),this.canvas.onmouseup=this.onMouseEvent.bind(this),this.canvas.onmousemove=this.onMouseEvent.bind(this),this.canvas.onmouseenter=this.onMouseEvent.bind(this),this.canvas.onmouseexit=this.onMouseEvent.bind(this),this.canvas.onmouseover=this.onMouseEvent.bind(this),this.canvas.onmouseout=this.onMouseEvent.bind(this),this.canvas.onmouseleave=this.onMouseEvent.bind(this),this.canvas.onclick=this.onMouseEvent.bind(this),this.canvas.ondblclick=this.onMouseEvent.bind(this),this.canvas.oncontextmenu=this.onMouseEvent.bind(this),this.canvas.ontouchstart=this.onTouchEvent.bind(this),this.canvas.ontouchend=this.onTouchEvent.bind(this),this.canvas.ontouchmove=this.onTouchEvent.bind(this),this.canvas.touchcancel=this.onTouchEvent.bind(this)),this.accumulator=0,"performance"in window?this.now=function(){return window.performance.now()}:this.now=function(){return window.Date.now()},"requestAnimationFrame"in window?this.requestAnimationFrame=function(t){window.requestAnimationFrame(t);}:this.requestAnimationFrame=function(t){setTimeout(t,-1);},this.startTime=this.now(),this.curTime=this.lastTime=0,this.main(this.curTime);}},{key:"renderCanvas",value:function(){this.canvas2d.clearRect(0,0,this.size.x,this.size.y),this.canvas2d.drawImage(this.source,0,0);}},{key:"renderGL",value:function(){this.textureSource.update(),this.gl.uniform1f(this.glLocations.time,this.curTime),this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.shader.useProgram(),this.textureSource.bind(),this.disableFeedbackTexture||this.textureFeedback.bind(),this.gl.drawArrays(this.gl.TRIANGLES,0,this.vertices.length/2),this.disableFeedbackTexture||this.textureFeedback.update();}},{key:"onResize",value:function(){var t,e,i=this.canvasContainer.offsetWidth,s=this.canvasContainer.offsetHeight,n=i/s,o=this.constructor.SCALE_MODES,r=1;switch(n<this.ratio?s=Math.round(i/this.ratio):i=Math.round(s*this.ratio),this.scaleMode){case o.MULTIPLES:for(r=1,t=this.size.x,e=this.size.y;t+this.size.x<=i||e+this.size.y<=s;)t+=this.size.x,e+=this.size.y,r+=1;break;case o.FIT:t=i,e=s,r=i/this.size.x;break;case o.COVER:i=this.canvasContainer.offsetWidth,s=this.canvasContainer.offsetHeight,n<this.ratio?i=Math.round(s*this.ratio):s=Math.round(i/this.ratio),t=i,e=s,r=i/this.size.x;break;case o.NONE:r=1,t=this.size.x,e=this.size.y;}this._scale=this.scaleMultiplier*r,this.canvas.style.width=t+"px",this.canvas.style.height=e+"px";}},{key:"onMouseEvent",value:function(t){var e=this.canvas,i=this.source,s=e.offsetLeft+e.scrollLeft,n=e.offsetTop+e.scrollTop,o=i.offsetLeft+i.scrollLeft,r=i.offsetTop+i.scrollTop,a=1/this._scale,h=new MouseEvent(t.type,{screenX:(t.screenX-s)*a+o,screenY:(t.screenY-n)*a+r,clientX:(t.clientX-s)*a+o,clientY:(t.clientY-n)*a+r,altKey:t.altKey,shiftKey:t.shiftKey,metaKey:t.metaKey,button:t.button,buttons:t.buttons,relatedTarget:t.relatedTarget,region:t.region});i.dispatchEvent(h);}},{key:"onTouchEvent",value:function(t){var e=this.canvas,i=this.source,s=e.offsetLeft+e.scrollLeft,n=e.offsetTop+e.scrollTop,o=i.offsetLeft+i.scrollLeft,r=i.offsetTop+i.scrollTop,a=1/this._scale,h=function(t){return new Touch({identifier:t.identifier,force:t.force,rotationAngle:t.rotationAngle,target:t.target,radiusX:t.radiusX,radiusY:t.radiusY,pageX:(t.pageX-s)*a+o,pageY:(t.pageY-s)*a+o,screenX:(t.screenX-s)*a+o,screenY:(t.screenY-n)*a+r,clientX:(t.clientX-s)*a+o,clientY:(t.clientY-n)*a+r})},c=Array.from(t.touches).map(h),l=Array.from(t.targetTouches).map(h),u=Array.from(t.changedTouches).map(h),d=new t.constructor(t.type,{touches:c,targetTouches:l,changedTouches:u,ctrlKey:t.ctrlKey,shiftKey:t.shiftKey,altKey:t.altKey,metaKey:t.metaKey});i.dispatchEvent(d);}}]),e}();r.SCALE_MODES=Object.freeze({FIT:"FIT",COVER:"COVER",MULTIPLES:"MULTIPLES",NONE:"NONE"});

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
*/

/*
Helper used to replace code in a script tag based on a search regex
To inject code without erasing original string, using capturing groups; e.g.
	inject(/(some string)/,'injected before $1 injected after')
*/
function inject(searchRegex, replaceString) {
	// find the relevant script tag
	var scriptTags = document.getElementsByTagName('script');
	var scriptTag;
	var code;
	for (var i = 0; i < scriptTags.length; ++i) {
		scriptTag = scriptTags[i];
		var matchesSearch = scriptTag.textContent.search(searchRegex) !== -1;
		var isCurrentScript = scriptTag === document.currentScript;
		if (matchesSearch && !isCurrentScript) {
			code = scriptTag.textContent;
			break;
		}
	}

	// error-handling
	if (!code) {
		throw new Error('Couldn\'t find "' + searchRegex + '" in script tags');
	}

	// modify the content
	code = code.replace(searchRegex, replaceString);

	// replace the old script tag with a new one using our modified code
	var newScriptTag = document.createElement('script');
	newScriptTag.textContent = code;
	scriptTag.insertAdjacentElement('afterend', newScriptTag);
	scriptTag.remove();
}

/**
 * Helper for getting an array with unique elements
 * @param  {Array} array Original array
 * @return {Array}       Copy of array, excluding duplicates
 */
function unique(array) {
	return array.filter(function (item, idx) {
		return array.indexOf(item) === idx;
	});
}

/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
HOW TO USE:
  import {before, after, inject, addDialogTag, addDeferredDialogTag} from "./helpers/kitsy-script-toolkit";

  before(targetFuncName, beforeFn);
  after(targetFuncName, afterFn);
  inject(searchRegex, replaceString);
  addDialogTag(tagName, dialogFn);
  addDeferredDialogTag(tagName, dialogFn);

  For more info, see the documentation at:
  https://github.com/seleb/bitsy-hacks/wiki/Coding-with-kitsy
*/

// Ex: after('load_game', function run() { alert('Loaded!'); });
function after(targetFuncName, afterFn) {
	var kitsy = kitsyInit();
	kitsy.queuedAfterScripts[targetFuncName] = kitsy.queuedAfterScripts[targetFuncName] || [];
	kitsy.queuedAfterScripts[targetFuncName].push(afterFn);
}

function kitsyInit() {
	// return already-initialized kitsy
	if (bitsy.kitsy) {
		return bitsy.kitsy;
	}

	// Initialize kitsy
	bitsy.kitsy = {
		queuedInjectScripts: [],
		queuedBeforeScripts: {},
		queuedAfterScripts: {},
	};

	var oldStartFunc = bitsy.startExportedGame;
	bitsy.startExportedGame = function doAllInjections() {
		// Only do this once.
		bitsy.startExportedGame = oldStartFunc;

		// Rewrite scripts and hook everything up.
		doInjects();
		applyAllHooks();

		// Start the game
		bitsy.startExportedGame.apply(this, arguments);
	};

	return bitsy.kitsy;
}

function doInjects() {
	bitsy.kitsy.queuedInjectScripts.forEach(function (injectScript) {
		inject(injectScript.searchRegex, injectScript.replaceString);
	});
	reinitEngine();
}

function applyAllHooks() {
	var allHooks = unique(Object.keys(bitsy.kitsy.queuedBeforeScripts).concat(Object.keys(bitsy.kitsy.queuedAfterScripts)));
	allHooks.forEach(applyHook);
}

function applyHook(functionName) {
	var functionNameSegments = functionName.split('.');
	var obj = bitsy;
	while (functionNameSegments.length > 1) {
		obj = obj[functionNameSegments.shift()];
	}
	var lastSegment = functionNameSegments[0];
	var superFn = obj[lastSegment];
	var superFnLength = superFn ? superFn.length : 0;
	var functions = [];
	// start with befores
	functions = functions.concat(bitsy.kitsy.queuedBeforeScripts[functionName] || []);
	// then original
	if (superFn) {
		functions.push(superFn);
	}
	// then afters
	functions = functions.concat(bitsy.kitsy.queuedAfterScripts[functionName] || []);

	// overwrite original with one which will call each in order
	obj[lastSegment] = function () {
		var returnVal;
		var args = [].slice.call(arguments);
		var i = 0;

		function runBefore() {
			// All outta functions? Finish
			if (i === functions.length) {
				return returnVal;
			}

			// Update args if provided.
			if (arguments.length > 0) {
				args = [].slice.call(arguments);
			}

			if (functions[i].length > superFnLength) {
				// Assume funcs that accept more args than the original are
				// async and accept a callback as an additional argument.
				return functions[i++].apply(this, args.concat(runBefore.bind(this)));
			}
			// run synchronously
			returnVal = functions[i++].apply(this, args);
			if (returnVal && returnVal.length) {
				args = returnVal;
			}
			return runBefore.apply(this, args);
		}

		return runBefore.apply(this, arguments);
	};
}

function reinitEngine() {
	// recreate the script and dialog objects so that they'll be
	// referencing the code with injections instead of the original
	bitsy.scriptModule = new bitsy.Script();
	bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();

	bitsy.dialogModule = new bitsy.Dialog();
	bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
	bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();
}

/**
😴
@file canvas replacement
@summary WebGLazy bitsy integration (this one's mostly just for me)
@license MIT
@version auto
@author Sean S. LeBlanc

@description
Replaces bitsy canvas with a responsive WebGL canvas (this one's mostly just for me)

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. For finer scaling, edit `var text_scale = 2` and `var scale = 4` in the bitsy source to `var text_scale = 1` and `var scale = 2`
3. Edit the hackOptions object passed to the `new WebGLazy` call as needed

The shader used to render the canvas can be overridden via hack options:
e.g.
var hackOptions = {
	glazyOptions = {
		fragment: `
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
		`,
	},
};
*/

var hackOptions = {
	glazyOptions: {
		background: 'black',
		scaleMode: 'MULTIPLES', // use "FIT" if you prefer size to pixel accuracy
		allowDownscaling: true,
		disableFeedbackTexture: true, // set this to false if you want to use the feedback texture
	},
	init: function (glazy) {
		// you can set up any custom uniforms you have here if needed
		// e.g. glazy.glLocations.myUniform = glazy.gl.getUniformLocation(glazy.shader.program, 'myUniform');
	},
	update: function (glazy) {
		// you can update any custom uniforms you have here if needed
		// e.g. glazy.gl.uniform1f(glazy.glLocations.myUniform, 0);
	},
};

var glazy;
after('startExportedGame', function () {
	glazy = new r(hackOptions.glazyOptions);
	if (hackOptions.init) {
		hackOptions.init(glazy);
	}
});

after('update', function () {
	if (hackOptions.update) {
		hackOptions.update(glazy);
	}
});





Object.assign(hackOptions.glazyOptions, hackOptions$1.glazyOptions);
hackOptions.glazyOptions.disableFeedbackTexture = false;
hackOptions.init = function (glazy) {
	glazy.glLocations.transitionTime = glazy.gl.getUniformLocation(glazy.shader.program, 'transitionTime');
	if (!hackOptions$1.includeTitle) {
		glazy.gl.uniform1f(glazy.glLocations.transitionTime, glazy.curTime - hackOptions$1.duration);
	}

	// hack textureFeedback update
	// so we can update it as-needed rather than every frame
	glazy.textureFeedback.oldUpdate = glazy.textureFeedback.update;
	glazy.textureFeedback.update = function () {};
};
hackOptions.update = function (glazy) {
	if (hackOptions$1.checkTransition()) {
		// transition occurred; update feedback texture to capture frame
		glazy.gl.uniform1f(glazy.glLocations.transitionTime, glazy.curTime);
		glazy.textureFeedback.oldUpdate();
	}
};

hackOptions.glazyOptions.fragment = `
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
		float t = clamp((time-transitionTime)/float(${hackOptions$1.duration}), 0.0, 1.0);
		${hackOptions$1.transition}
		gl_FragColor = vec4(result, 1.0);
	}
`;

exports.hackOptions = hackOptions$1;

Object.defineProperty(exports, '__esModule', { value: true });

}(this.hacks.transitions = this.hacks.transitions || {}, window));

/**
😴
@file canvas replacement
@summary WebGLazy bitsy integration (this one's mostly just for me)
@license MIT
@author Sean S. LeBlanc
@version 20.1.2
@requires Bitsy 7.12


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

See https://github.com/seleb/WebGLazy#configuration for more options
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
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

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

bitsy = bitsy || /*#__PURE__*/_interopDefaultLegacy(bitsy);

function t(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function e(t,e){for(var i=0;i<e.length;i++){var s=e[i];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(t,s.key,s);}}function i(t,i,s){return i&&e(t.prototype,i),s&&e(t,s),t}function s(t){if(!s.context&&(s.context=t.getContext("webgl")||t.getContext("experimental-webgl"),!s.context))throw "No WebGL support";return s.context}var n=function(){function e(i,n){t(this,e),this.gl=new s,this.vertSource=i,this.fragSource=n,this.program=this.gl.createProgram();try{this.vertShader=this.compileShader(this.vertSource,this.gl.VERTEX_SHADER),this.fragShader=this.compileShader(this.fragSource,this.gl.FRAGMENT_SHADER);}catch(t){throw this.gl.deleteProgram(this.program),delete this.program,console.error("Couldn't create shader: ",t),t}this.gl.attachShader(this.program,this.vertShader),this.gl.deleteShader(this.vertShader),delete this.vertShader,this.gl.attachShader(this.program,this.fragShader),this.gl.deleteShader(this.fragShader),delete this.fragShader,this.gl.linkProgram(this.program);}return i(e,[{key:"compileShader",value:function(t,e){try{var i=this.gl.createShader(e);if(this.gl.shaderSource(i,t),this.gl.compileShader(i),!this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS))throw this.gl.getShaderInfoLog(i);return i}catch(i){throw console.error("Couldn't compile shader (".concat(e,"): "),t,i),i}}},{key:"useProgram",value:function(){this.gl.useProgram(this.program);}}]),e}(),o=function(){function e(i,n,o){t(this,e),this.gl=new s,this.source=i,this.texture=this.gl.createTexture(),this.bind(n),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,this.source),this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,!0),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,o?this.gl.NEAREST:this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,o?this.gl.NEAREST:this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.bindTexture(this.gl.TEXTURE_2D,null);}return i(e,[{key:"update",value:function(){this.bind(),this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,!0),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,this.source),this.gl.bindTexture(this.gl.TEXTURE_2D,null);}},{key:"bind",value:function(t){var e=t||this.lastBoundId||0;this.gl.activeTexture(this.gl.TEXTURE0+e),this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture),this.lastBoundId=e;}}]),e}(),r="// default vertex shader\nattribute vec4 position;\nvoid main() {\n\tgl_Position = position;\n}",a="// default fragment shader\nprecision mediump float;\nuniform sampler2D tex0;\nuniform sampler2D tex1;\nuniform vec2 resolution;\n\nvoid main() {\n\tvec2 coord = gl_FragCoord.xy;\n\tvec2 uv = coord.xy / resolution.xy;\n\tgl_FragColor = texture2D(tex0, uv);\n}",h=function(){function e(i){var s=this,n=i.source,o=i.sources,h=void 0===o?["canvas","video","img"]:o,c=i.hideSource,l=void 0===c||c,u=i.background,d=void 0===u?"black":u,g=i.scaleMultiplier,m=void 0===g?1:g,v=i.scaleMode,f=void 0===v?e.SCALE_MODES.FIT:v,p=i.allowDownscaling,E=void 0!==p&&p,T=i.timestep,b=void 0===T?1/60*1e3:T,x=i.disableFeedbackTexture,y=void 0!==x&&x,w=i.disableMouseEvents,S=void 0!==w&&w,A=i.pixelate,L=void 0===A||A,_=i.autoInit,R=void 0===_||_,F=i.vertex,M=void 0===F?r:F,C=i.fragment,k=void 0===C?a:C;t(this,e),this.main=function(t){s.lastTime=s.curTime,s.curTime=(t||s.now())-s.startTime,s.deltaTime=s.curTime-s.lastTime,s.accumulator+=s.deltaTime,s.accumulator>s.timestep&&(s.render(),s.accumulator-=s.timestep),s.requestAnimationFrame(s.main);},this.sources=h,this.source=n||this.getSource(),this.hideSource=l,this.background=d,this.scaleMultiplier=m,this._scale=m,this.scaleMode=f,this.allowDownscaling=E,this.timestep=b,this.disableFeedbackTexture=!!y,this.disableMouseEvents=!!S,this.pixelate=L,this.vertex=M,this.fragment=k,R&&this.init();}return i(e,[{key:"getSource",value:function(){var t,e=[];for(t=0;t<this.sources.length;++t)e.push(Array.prototype.slice.call(document.getElementsByTagName(this.sources[t])));if(0===(e=Array.prototype.concat.apply([],e)).length)throw "Couldn't find an element from "+this.sources+" to use as a source";return e[0]}},{key:"insertStylesheet",value:function(){this.style=document.createElement("style"),document.head.appendChild(this.style),this.style.innerHTML="\nhtml,body,div#canvasContainer{\n\tpadding:0;\n\tmargin:0;\n\n\twidth:100%;\n\theight:100%;\n\n\ttop:0;\n\tleft:0;\n\tright:0;\n\tbottom:0;\n\n\tbackground: ".concat(this.background,";\n\tcolor:#FFFFFF;\n\n\toverflow:hidden;\n\n\t").concat(this.hideSource?"visibility: hidden!important;":"","\n}\n\ncanvas#outputCanvas{\n").concat(this.pixelate?"\n\timage-rendering: optimizeSpeed;\n\timage-rendering: -webkit-crisp-edges;\n\timage-rendering: -moz-crisp-edges;\n\timage-rendering: -o-crisp-edges; \n\timage-rendering: crisp-edges;\n\timage-rendering: -webkit-optimize-contrast;\n\timage-rendering: optimize-contrast;\n\timage-rendering: pixelated;\n\t-ms-interpolation-mode: nearest-neighbor;\n":"","\n\n\tposition:absolute;\n\tmargin:auto;\n\ttop:0;\n\tleft:-1000%;\n\tright:-1000%;\n\tbottom:0;\n\n\t\t\t").concat(this.hideSource?" visibility: visible!important;":"","\n\t\t\t").concat(this.scaleMode===this.constructor.SCALE_MODES.MULTIPLES?"\n\ttransition:\n\t\twidth  0.2s cubic-bezier(0.22, 1.84, 0.88, 0.77),\n\t\theight 0.2s cubic-bezier(0.22, 1.84, 0.88, 0.77);":"","\n};");}},{key:"init",value:function(){this.size={x:this.source.width||this.source.style.width,y:this.source.height||this.source.style.height},this.size.x*=this.scaleMultiplier||1,this.size.y*=this.scaleMultiplier||1,this.ratio=this.size.x/this.size.y,this.insertStylesheet(),this.canvasContainer=document.createElement("div"),this.canvasContainer.id="canvasContainer",this.allowDownscaling||(this.canvasContainer.style.minWidth=this.size.x+"px",this.canvasContainer.style.minHeight=this.size.y+"px"),this.canvas=document.createElement("canvas"),this.canvas.id="outputCanvas",this.canvas.width=this.size.x,this.canvas.height=this.size.y,this.canvas.style.width=this.canvas.style.height=0,this.canvasContainer.appendChild(this.canvas),document.body.appendChild(this.canvasContainer);try{this.gl=new s(this.canvas),this.render=this.renderGL;}catch(t){console.warn("Falling back to canvas rendering: ",t),this.render=this.renderCanvas,this.canvas2d=this.canvas.getContext("2d");}this.gl&&(this.vertices=new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),this.vertexBuffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vertexBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,this.vertices,this.gl.STATIC_DRAW),this.textureSource=new o(this.source,0,this.pixelate),this.disableFeedbackTexture||(this.textureFeedback=new o(this.canvas,1,this.pixelate)),this.setShader(this.vertex,this.fragment),this.gl.viewport(0,0,this.size.x,this.size.y),this.gl.clearColor(0,0,0,1)),window.onresize=this.onResize.bind(this),window.onresize(),this.disableMouseEvents||(this.canvas.onmousedown=this.onMouseEvent.bind(this),this.canvas.onmouseup=this.onMouseEvent.bind(this),this.canvas.onmousemove=this.onMouseEvent.bind(this),this.canvas.onmouseenter=this.onMouseEvent.bind(this),this.canvas.onmouseexit=this.onMouseEvent.bind(this),this.canvas.onmouseover=this.onMouseEvent.bind(this),this.canvas.onmouseout=this.onMouseEvent.bind(this),this.canvas.onmouseleave=this.onMouseEvent.bind(this),this.canvas.onclick=this.onMouseEvent.bind(this),this.canvas.ondblclick=this.onMouseEvent.bind(this),this.canvas.oncontextmenu=this.onMouseEvent.bind(this),this.canvas.ontouchstart=this.onTouchEvent.bind(this),this.canvas.ontouchend=this.onTouchEvent.bind(this),this.canvas.ontouchmove=this.onTouchEvent.bind(this),this.canvas.touchcancel=this.onTouchEvent.bind(this)),this.accumulator=0,"performance"in window?this.now=function(){return window.performance.now()}:this.now=function(){return window.Date.now()},"requestPostAnimationFrame"in window?this.requestAnimationFrame=function(t){window.requestPostAnimationFrame(t);}:"requestAnimationFrame"in window?this.requestAnimationFrame=function(t){window.requestAnimationFrame(t);}:this.requestAnimationFrame=function(t){setTimeout(t,-1);},this.startTime=this.now(),this.curTime=this.lastTime=0,this.main(this.curTime);}},{key:"setShader",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:r,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:a;this.program&&this.gl.deleteProgram(this.program),this.shader=new n(t,e),this.shader.useProgram(),this.glLocations={position:this.gl.getAttribLocation(this.shader.program,"position"),tex0:this.gl.getUniformLocation(this.shader.program,"tex0"),tex1:this.gl.getUniformLocation(this.shader.program,"tex1"),time:this.gl.getUniformLocation(this.shader.program,"time"),resolution:this.gl.getUniformLocation(this.shader.program,"resolution")},this.gl.uniform1i(this.glLocations.tex0,0),this.gl.uniform1i(this.glLocations.tex1,1),this.gl.uniform2f(this.glLocations.resolution,this.size.x,this.size.y),this.gl.enableVertexAttribArray(this.glLocations.position),this.gl.vertexAttribPointer(this.glLocations.position,2,this.gl.FLOAT,!1,0,0);}},{key:"renderCanvas",value:function(){this.canvas2d.clearRect(0,0,this.size.x,this.size.y),this.canvas2d.drawImage(this.source,0,0);}},{key:"renderGL",value:function(){this.textureSource.update(),this.gl.uniform1f(this.glLocations.time,this.curTime),this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.shader.useProgram(),this.textureSource.bind(),this.disableFeedbackTexture||this.textureFeedback.bind(),this.gl.drawArrays(this.gl.TRIANGLES,0,this.vertices.length/2),this.disableFeedbackTexture||this.textureFeedback.update();}},{key:"onResize",value:function(){var t,e,i=this.canvasContainer.offsetWidth,s=this.canvasContainer.offsetHeight,n=i/s,o=this.constructor.SCALE_MODES,r=1;switch(n<this.ratio?s=Math.round(i/this.ratio):i=Math.round(s*this.ratio),this.scaleMode){case o.MULTIPLES:for(r=1,t=this.size.x,e=this.size.y;t+this.size.x<=i||e+this.size.y<=s;)t+=this.size.x,e+=this.size.y,r+=1;break;case o.FIT:t=i,e=s,r=i/this.size.x;break;case o.COVER:i=this.canvasContainer.offsetWidth,s=this.canvasContainer.offsetHeight,n<this.ratio?i=Math.round(s*this.ratio):s=Math.round(i/this.ratio),t=i,e=s,r=i/this.size.x;break;case o.NONE:r=1,t=this.size.x,e=this.size.y;}this._scale=this.scaleMultiplier*r,this.canvas.style.width=t+"px",this.canvas.style.height=e+"px";}},{key:"onMouseEvent",value:function(t){var e=this.canvas,i=this.source,s=e.offsetLeft+e.scrollLeft,n=e.offsetTop+e.scrollTop,o=i.offsetLeft+i.scrollLeft,r=i.offsetTop+i.scrollTop,a=1/this._scale,h=new MouseEvent(t.type,{screenX:(t.screenX-s)*a+o,screenY:(t.screenY-n)*a+r,clientX:(t.clientX-s)*a+o,clientY:(t.clientY-n)*a+r,altKey:t.altKey,shiftKey:t.shiftKey,metaKey:t.metaKey,button:t.button,buttons:t.buttons,relatedTarget:t.relatedTarget,region:t.region});i.dispatchEvent(h);}},{key:"onTouchEvent",value:function(t){var e=this.canvas,i=this.source,s=e.offsetLeft+e.scrollLeft,n=e.offsetTop+e.scrollTop,o=i.offsetLeft+i.scrollLeft,r=i.offsetTop+i.scrollTop,a=1/this._scale,h=function(t){return new Touch({identifier:t.identifier,force:t.force,rotationAngle:t.rotationAngle,target:t.target,radiusX:t.radiusX,radiusY:t.radiusY,pageX:(t.pageX-s)*a+o,pageY:(t.pageY-s)*a+o,screenX:(t.screenX-s)*a+o,screenY:(t.screenY-n)*a+r,clientX:(t.clientX-s)*a+o,clientY:(t.clientY-n)*a+r})},c=Array.from(t.touches).map(h),l=Array.from(t.targetTouches).map(h),u=Array.from(t.changedTouches).map(h),d=new t.constructor(t.type,{touches:c,targetTouches:l,changedTouches:u,ctrlKey:t.ctrlKey,shiftKey:t.shiftKey,altKey:t.altKey,metaKey:t.metaKey});i.dispatchEvent(d);}}]),e}();h.SCALE_MODES=Object.freeze({FIT:"FIT",COVER:"COVER",MULTIPLES:"MULTIPLES",NONE:"NONE"});

/**
 * Helper used to replace code in a script tag based on a search regex.
 * To inject code without erasing original string, using capturing groups; e.g.
 * ```js
 * inject(/(some string)/,'injected before $1 injected after');
 * ```
 * @param searcher Regex to search and replace
 * @param replacer Replacer string/fn
 */
function inject(searcher, replacer) {
    // find the relevant script tag
    var scriptTags = document.getElementsByTagName('script');
    var scriptTag;
    var code = '';
    for (var i = 0; i < scriptTags.length; ++i) {
        scriptTag = scriptTags[i];
        if (!scriptTag.textContent)
            continue;
        var matchesSearch = scriptTag.textContent.search(searcher) !== -1;
        var isCurrentScript = scriptTag === document.currentScript;
        if (matchesSearch && !isCurrentScript) {
            code = scriptTag.textContent;
            break;
        }
    }
    // error-handling
    if (!code || !scriptTag) {
        throw new Error('Couldn\'t find "' + searcher + '" in script tags');
    }
    // modify the content
    code = code.replace(searcher, replacer);
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
// Ex: inject(/(names.sprite.set\( name, id \);)/, '$1console.dir(names)');
/** test */
function kitsyInject(searcher, replacer) {
    if (!kitsy.queuedInjectScripts.some(function (script) {
        return searcher.toString() === script.searcher.toString() && replacer === script.replacer;
    })) {
        kitsy.queuedInjectScripts.push({
            searcher: searcher,
            replacer: replacer,
        });
    }
    else {
        console.warn('Ignored duplicate inject');
    }
}
// Ex: before('load_game', function run() { alert('Loading!'); });
//     before('show_text', function run(text) { return text.toUpperCase(); });
//     before('show_text', function run(text, done) { done(text.toUpperCase()); });
function before(targetFuncName, beforeFn) {
    kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
    kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
}
// Ex: after('load_game', function run() { alert('Loaded!'); });
function after$1(targetFuncName, afterFn) {
    kitsy.queuedAfterScripts[targetFuncName] = kitsy.queuedAfterScripts[targetFuncName] || [];
    kitsy.queuedAfterScripts[targetFuncName].push(afterFn);
}
function applyInjects() {
    kitsy.queuedInjectScripts.forEach(function (injectScript) {
        inject(injectScript.searcher, injectScript.replacer);
    });
}
function applyHooks(root) {
    var allHooks = unique(Object.keys(kitsy.queuedBeforeScripts).concat(Object.keys(kitsy.queuedAfterScripts)));
    allHooks.forEach(applyHook.bind(this, root || window));
}
function applyHook(root, functionName) {
    var functionNameSegments = functionName.split('.');
    var obj = root;
    while (functionNameSegments.length > 1) {
        obj = obj[functionNameSegments.shift()];
    }
    var lastSegment = functionNameSegments[0];
    var superFn = obj[lastSegment];
    var superFnLength = superFn ? superFn.length : 0;
    var functions = [];
    // start with befores
    functions = functions.concat(kitsy.queuedBeforeScripts[functionName] || []);
    // then original
    if (superFn) {
        functions.push(superFn);
    }
    // then afters
    functions = functions.concat(kitsy.queuedAfterScripts[functionName] || []);
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
/**
@file kitsy-script-toolkit
@summary Monkey-patching toolkit to make it easier and cleaner to run code before and after functions or to inject new code into script tags
@license WTFPL (do WTF you want)
@author Original by mildmojo; modified by Sean S. LeBlanc
@version 20.1.2
@requires Bitsy 7.12

*/
var kitsy = (window.kitsy = window.kitsy || {
    queuedInjectScripts: [],
    queuedBeforeScripts: {},
    queuedAfterScripts: {},
    inject: kitsyInject,
    before,
    after: after$1,
    /**
     * Applies all queued `inject` calls.
     *
     * An object that instantiates an class modified via injection will still refer to the original class,
     * so make sure to reinitialize globals that refer to injected scripts before calling `applyHooks`.
     */
    applyInjects,
    /** Apples all queued `before`/`after` calls. */
    applyHooks,
});

var hooked = kitsy.hooked;
if (!hooked) {
	kitsy.hooked = true;
	var oldStartFunc = bitsy.startExportedGame;
	bitsy.startExportedGame = function doAllInjections() {
		// Only do this once.
		bitsy.startExportedGame = oldStartFunc;

		// Rewrite scripts
		kitsy.applyInjects();

		// recreate the script and dialog objects so that they'll be
		// referencing the code with injections instead of the original
		bitsy.scriptModule = new bitsy.Script();
		bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();

		bitsy.dialogModule = new bitsy.Dialog();
		bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
		bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();
		bitsy.renderer = new bitsy.TileRenderer(bitsy.tilesize);

		// Hook everything
		kitsy.applyHooks();

		// reset callbacks using hacked functions
		bitsy.bitsyOnUpdate(bitsy.update);
		bitsy.bitsyOnQuit(bitsy.stopGame);
		bitsy.bitsyOnLoad(bitsy.load_game);

		// Start the game
		bitsy.startExportedGame.apply(this, arguments);
	};
}

/** @see kitsy.inject */
kitsy.inject;
/** @see kitsy.before */
kitsy.before;
/** @see kitsy.after */
var after = kitsy.after;





var glazy;
after('startExportedGame', function () {
	glazy = new h(hackOptions.glazyOptions);
	document.querySelector('#canvasContainer').style.pointerEvents = 'none';
	document.querySelector('#touchTrigger').style.visibility = 'initial';
	if (hackOptions.init) {
		hackOptions.init(glazy);
	}
});

after('update', function () {
	if (hackOptions.update) {
		hackOptions.update(glazy);
	}
});

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})(this.hacks.canvas_replacement = this.hacks.canvas_replacement || {}, window);

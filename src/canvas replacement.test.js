import {
	end, press, snapshot, start,
} from './test/bitsy';

test('canvas replacement', async () => {
	await start({
		hacks: [
			[
				'canvas replacement',
				{
					glazyOptions: {
						background: 'black',
						scaleMode: 'FIT',
						allowDownscaling: true,
						disableFeedbackTexture: true,
						fragment: `
// tint fragment shader
precision mediump float;
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform float time;
uniform vec2 resolution;

void main(){
	gl_FragColor = vec4(texture2D(tex0, gl_FragCoord.xy / resolution.xy).rg, 0.0, 1.0);
}`,
					},
				},
			],
		],
	});
	await press('Enter'); // complete title page
	await press('Enter'); // end title page
	await snapshot();
	await end();
});

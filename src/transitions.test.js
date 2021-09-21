import { delay, end, press, snapshot, start } from './test/bitsy';

test('transitions', async () => {
	await start({
		hacks: [
			[
				'transitions',
				{
					duration: 2000,
					includeTitle: false,
					checkTransition: function () {
						var x = window.player().x;
						if (this.x !== x) {
							this.x = x;
							return true;
						}
						return false;
					},
					transition: `
if (t < 0.01 || t > 0.99) {
	result = end;
} else {
	result = mix(vec3(1.0,0.0,0.0), vec3(0.0,1.0,0.0), step(0.5, t));
}
`,
					glazyOptions: {
						scaleMode: 'FIT',
						allowDownscaling: true,
					},
				},
			],
		],
	});
	await press('ArrowRight'); // complete title page
	await press('ArrowRight'); // end title page
	await delay(2000);
	await snapshot();
	await press('ArrowRight');
	await snapshot();
	await delay(1000);
	await snapshot();
	await delay(1000);
	await snapshot();
	await end();
});

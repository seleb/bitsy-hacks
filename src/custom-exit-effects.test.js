import {
	delay,
	end,
	press,
	snapshot,
	start,
	walkToCat,
} from './test/bitsy';

test('strike', async () => {
	await start({
		catDialog: '{exit "0" 0 0 "test"}',
		hacks: [
			[
				'custom-exit-effects',
				{
					test: {
						showPlayerStart: true,
						showPlayerEnd: true,
						duration: 2000,
						frameRate: 8,
						pixelEffectFunc: function (_start, _end, _pixelX, _pixelY, delta) {
							return delta < 0.5
								? {
									r: 255, g: 0, b: 0, a: 255,
								} : {
									r: 0, g: 255, b: 0, a: 255,
								};
						},
					},
				},
			],
		],
	});
	await walkToCat();
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await snapshot();
	await delay(1000);
	await snapshot();
	await delay(1000);
	await snapshot();
	await end();
});

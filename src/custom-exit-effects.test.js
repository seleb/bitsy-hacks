import { delay, end, press, snapshot, start, walkToCat } from './test/bitsy';

test('custom-exit-effect', async () => {
	await start({
		catDialog: '{exit "0" 0 0 "test"}',
		hacks: [
			[
				'custom-exit-effects',
				{
					test: {
						showPlayerStart: true,
						showPlayerEnd: true,
						stepCount: 16,
						pixelEffectFunc: function (_start, _end, _pixelX, _pixelY, _delta) {
							return 16;
						},
						paletteEffectFunc: function (_start, _end, delta) {
							if (delta > 1 - 2 / 16) {
								return _end.Palette;
							}
							return [delta < 0.5 ? [255, 0, 0] : [0, 255, 0], _end.Palette[1], _end.Palette[2]];
						},
					},
				},
			],
		],
	});
	await walkToCat();
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await delay(125 * 16 * 0.25);
	await snapshot();
	await delay(125 * 16 * 0.25);
	await snapshot();
	await delay(125 * 16 * 0.5);
	await snapshot();
	await end();
});

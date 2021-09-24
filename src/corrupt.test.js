import { evaluate, press, snapshot, start, walkToCat } from './test/bitsy';

test('corrupt', async () => {
	await start({
		hacks: [
			[
				'corrupt',
				{
					tilemapFreq: 1,
					tilePixelsFreq: 1,
					spritePixelsFreq: 1,
					itemPixelsFreq: 1,
					fontPixelsFreq: 1,
					paletteFreq: 1,
					globalFreq: 100,
					paletteAmplitude: 100,
				},
			],
		],
	});
	// deterministic rng
	await evaluate(() => {
		let i = 0;
		Math.random = () => (++i % 100) / 100;
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // skip dialogue
	await snapshot();
});

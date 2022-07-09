import { press, snapshot, start, walkToCat } from './test/bitsy';

test('autoreset, dialog only', async () => {
	await start({
		catDialog: '(portrait "cat")\\(portrait "cat"\\)',
		hacks: [
			[
				'character portraits',
				{
					scale: 1 / 128,
					portraits: {
						cat: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', // rgba(255,0,0,0.5) pixel
					},
					autoReset: true,
					dialogOnly: true,
				},
			],
		],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog page
	await snapshot();
});

test('no reset, persist', async () => {
	await start({
		catDialog: `"""
{cycle
  - (portrait "cat")\\(portrait "cat"\\)
  - (portrait "")\\(portrait ""\\)
}
"""`,
		hacks: [
			[
				'character portraits',
				{
					scale: 1 / 128,
					portraits: {
						cat: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', // rgba(255,0,0,0.5) pixel
					},
					autoReset: false,
					dialogOnly: false,
				},
			],
		],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog page
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog page
	await snapshot();
});

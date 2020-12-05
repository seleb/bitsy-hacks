import {
	end,
	press,
	snapshot,
	start,
	walkToCat,
} from './test/bitsy';

test('autoreset, dialog only', async () => {
	await start({
		catDialog: `{>>
	{SEQ
		{>> {portrait "cat"}portrait applied}
		{>> portrait autoreset}
	}
}`,
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
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // end dialog page
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

test('no reset, persist', async () => {
	await start({
		catDialog: `{>>
	{SEQ
		{>> {portrait "cat"}portrait applied}
		{>> {portrait ""}portrait removed}
	}
}`,
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
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // end dialog page
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // end dialog page
	await snapshot();
	await end();
});

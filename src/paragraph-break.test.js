import { press, snapshot, start, waitForBlip, walkToCat } from './test/bitsy';

test('p', async () => {
	await start({
		catDialog: 'paragraph 1(p)paragraph 2',
		hacks: ['paragraph-break'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // next dialog page
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog
	await snapshot();
});

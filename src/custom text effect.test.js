import { press, snapshot, start, waitForBlip, walkToCat } from './test/bitsy';

test('strike', async () => {
	await start({
		catDialog: '{strike}strike{strike}{br}custom text effect',
		hacks: ['custom text effect'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog page
	await snapshot();
});

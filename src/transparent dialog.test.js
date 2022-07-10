import { press, snapshot, start, waitForBlip, walkToCat } from './test/bitsy';

test('transparent dialog', async () => {
	await start({
		hacks: ['transparent dialog'],
	});
	await walkToCat();
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog page
	await snapshot();
});

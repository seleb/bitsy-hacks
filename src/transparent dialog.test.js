import { end, press, snapshot, start, walkToCat } from './test/bitsy';

test('transparent dialog', async () => {
	await start({
		hacks: ['transparent dialog'],
	});
	await walkToCat();
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await end();
});

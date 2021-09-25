import { press, snapshot, start, walkToCat } from './test/bitsy';

test('push-sprites', async () => {
	await start({
		hacks: ['push-sprites'],
	});
	await walkToCat();
	await snapshot();
	await press('ArrowRight');
	await snapshot();
});

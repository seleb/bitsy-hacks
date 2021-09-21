import { delay, end, press, snapshot, start, walkToCat } from './test/bitsy';

test('dialog pause', async () => {
	await start({
		catDialog: "I'm a{pause 2000} cat",
		hacks: ['dialog pause'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await delay(1000);
	await snapshot();
	await delay(2000);
	await snapshot();
	await end();
});

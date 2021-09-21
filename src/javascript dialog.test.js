import { end, press, snapshot, start, walkToCat } from './test/bitsy';

test('now', async () => {
	await start({
		hacks: ['javascript dialog'],
		catDialog: '{jsNow "canvas.width *= 2"}I\'m a cat',
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await end();
});

test('deferred', async () => {
	await start({
		hacks: ['javascript dialog'],
		catDialog: '{js "canvas.width *= 2"}I\'m a cat',
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // close dialog page
	await snapshot();
	await end();
});

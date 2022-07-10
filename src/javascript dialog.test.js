import { press, snapshot, start, waitForBlip, walkToCat } from './test/bitsy';

test('now', async () => {
	await start({
		hacks: ['javascript dialog'],
		catDialog: '{jsNow "bitsy._getCanvas().width *= 2"}I\'m a cat',
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog page
	await snapshot();
});

test('deferred', async () => {
	await start({
		hacks: ['javascript dialog'],
		catDialog: '{js "bitsy._getCanvas().width *= 2"}I\'m a cat',
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // close dialog page
	await snapshot();
});

test('returns evaluated value', async () => {
	await start({
		hacks: ['javascript dialog'],
		catDialog: `{a = 10 * {jsNow "Math.floor(scriptInterpreter.GetVariable('a')/10)"}}{print a}`,
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog page
	await snapshot();
});

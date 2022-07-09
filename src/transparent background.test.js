import { evaluate, press, snapshot, start, waitForBlip, walkToCat } from './test/bitsy';

test('transparent background', async () => {
	await start({
		hacks: ['transparent background'],
	});
	await evaluate('document.getElementById("game").style.background = "red";');
	await walkToCat();
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog page
	await snapshot();
});

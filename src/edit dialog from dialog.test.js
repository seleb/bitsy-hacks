import { press, snapshot, start, waitForBlip, walkToCat } from './test/bitsy';

test('dialog', async () => {
	await start({
		catDialog: '\\(dialog "SPR, a, new dialog"\\)(dialog "SPR, a, new dialog")',
		hacks: ['edit dialog from dialog'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog
	await snapshot();
	await press('ArrowRight'); // talk to cat again
	await waitForBlip();
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog
	await snapshot();
});

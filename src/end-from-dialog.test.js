import { end, press, snapshot, start, walkToCat } from './test/bitsy';

test('end', async () => {
	await start({
		catDialog: '\\(end "ending"\\)(end "ending")',
		hacks: ['end-from-dialog'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // complete ending page
	await snapshot();
	await end();
});

test('endNow', async () => {
	await start({
		catDialog: '\\(endNow "ending"\\)(endNow "ending")',
		hacks: ['end-from-dialog'],
	});
	await walkToCat();
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page (also completes ending page due to hack quirk)
	await snapshot();
	await end();
});

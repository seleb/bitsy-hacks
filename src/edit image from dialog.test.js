import { press, snapshot, start, walkToCat } from './test/bitsy';

test('image', async () => {
	await start({
		catDialog: '\\(image "SPR, a, A"\\)(image "SPR, a, A")',
		hacks: ['edit image from dialog'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog
	await snapshot();
});

test('imageNow', async () => {
	await start({
		catDialog: '\\(imageNow "SPR, a, A"\\)(imageNow "SPR, a, A")',
		hacks: ['edit image from dialog'],
	});
	await walkToCat();
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
});

test('compatible with transparency', async () => {
	await start({
		catDialog: '\\(imageNow "SPR, A, a"\\)(imageNow "SPR, A, a")',
		hacks: ['edit image from dialog', 'transparent sprites'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await press('ArrowRight'); // close dialog
	await press('ArrowDown');
	await press('ArrowDown'); // walk on top of tile border
	await snapshot();
});

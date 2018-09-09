import {
	start,
	walkToCat,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('image', async () => {
	await start({
		catDialog: '\\(image "SPR, a, A"\\)(image "SPR, a, A")',
		hacks: ['edit image from dialog'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // end dialog
	await snapshot();
	await end();
});

test('imageNow', async () => {
	await start({
		catDialog: '\\(imageNow "SPR, a, A"\\)(imageNow "SPR, a, A")',
		hacks: ['edit image from dialog'],
	});
	await walkToCat();
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

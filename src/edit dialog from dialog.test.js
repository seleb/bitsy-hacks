import {
	start,
	walkToCat,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('dialog', async () => {
	await start({
		catDialog: '\\(dialog "SPR, a, new dialog"\\)(dialog "SPR, a, new dialog")',
		hacks: ['edit dialog from dialog'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog
	await snapshot();
	await press('ArrowRight'); // talk to cat again
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog
	await snapshot();
	await end();
});

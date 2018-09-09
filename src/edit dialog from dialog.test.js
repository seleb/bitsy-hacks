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
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // end dialog
	await snapshot();
	await press('ArrowRight'); // talk to cat again
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // end dialog
	await snapshot();
	await end();
});

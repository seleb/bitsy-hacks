import {
	start,
	walkToCat,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('exit', async () => {
	await start({
		catDialog: '\\(exit "0,1,1"\\)(exit "0,1,1")',
		hacks: ['exit-from-dialog'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // end dialog
	await snapshot();
	await end();
});

test('exitNow', async () => {
	await start({
		catDialog: '\\(exitNow "0,1,1"\\)(exitNow "0,1,1")',
		hacks: ['exit-from-dialog'],
	});
	await walkToCat();
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

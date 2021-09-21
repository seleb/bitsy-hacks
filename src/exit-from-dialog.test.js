import { press, snapshot, start, walkToCat } from './test/bitsy';

test('exit', async () => {
	await start({
		catDialog: '\\(exit "0,1,1"\\)(exit "0,1,1")',
		hacks: ['exit-from-dialog'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog
	await snapshot();
});

test('exitNow', async () => {
	await start({
		catDialog: '\\(exitNow "0,1,1"\\)(exitNow "0,1,1")',
		hacks: ['exit-from-dialog'],
	});
	await walkToCat();
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
});

import { end, press, snapshot, start } from './test/bitsy';

test('opaque tiles', async () => {
	await start({
		hacks: ['opaque tiles'],
	});
	await press('ArrowRight'); // complete title page
	await press('ArrowRight'); // end title page
	await press('ArrowLeft');
	await press('ArrowLeft');
	await press('ArrowLeft'); // walk on top of tile border
	await snapshot();
	await end();
});

test('compatible with transparency', async () => {
	await start({
		hacks: ['opaque tiles', 'transparent sprites'],
	});
	await press('ArrowRight'); // complete title page
	await press('ArrowRight'); // end title page
	await press('ArrowLeft');
	await press('ArrowLeft');
	await press('ArrowLeft'); // walk on top of tile border
	await snapshot();
	await end();
});

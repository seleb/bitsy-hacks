import {
	start,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('opaque tiles', async () => {
	await start({
		hacks: ['opaque tiles'],
	});
	await press('Enter'); // complete title page
	await press('Enter'); // end title page
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
	await press('Enter'); // complete title page
	await press('Enter'); // end title page
	await press('ArrowLeft');
	await press('ArrowLeft');
	await press('ArrowLeft'); // walk on top of tile border
	await snapshot();
	await end();
})

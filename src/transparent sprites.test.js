import {
	start,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('transparent sprites', async () => {
	await start({
		hacks: ['transparent sprites'],
	});
	await press('ArrowRight'); // complete title page
	await press('ArrowRight'); // end title page
	await press('ArrowLeft');
	await press('ArrowLeft');
	await press('ArrowLeft'); // walk on top of tile border
	await snapshot();
	await end();
});

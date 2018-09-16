import {
	start,
	press,
	end,
	snapshot,
	delay,
} from './test/bitsy';

test('follower', async () => {
	await start({
		hacks: ['follower'],
	});
	await press('Enter'); // complete title page
	await press('Enter'); // end title page
	await press('ArrowLeft');
	await press('ArrowLeft');
	await press('ArrowLeft'); // walk on top of tile border
	await delay(500); // wait for follower to catch up
	await snapshot();
	await end();
});

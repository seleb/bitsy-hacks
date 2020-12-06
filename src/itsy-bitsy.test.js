import {
	start,
	press,
	end,
	snapshot,
	evaluate,
} from './test/bitsy';

test('itsy-bitsy', async () => {
	await start({
		hacks: ['itsy-bitsy'],
	});
	await press('Enter');
	await snapshot();
	await press('Enter');
	await press('Enter'); // complete title pages
	await evaluate(() => {
		window.room[window.curRoom].tilemap[window.player().y][window.player().x + 1] = '2';
		window.initRoom(window.curRoom);
	});
	await snapshot();
	await press('Enter'); // end title
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // end dialog
	await press('ArrowUp');
	await press('ArrowRight');
	await snapshot();
	await press('ArrowDown'); // talk to cat from above
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

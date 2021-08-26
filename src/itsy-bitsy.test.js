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
	await evaluate(() => {
		window.sprite.a.x = window.player().x + 1;
		window.sprite.a.y = window.player().y;
	});
	await press('ArrowRight');
	await press('ArrowRight');
	await press('ArrowRight'); // complete title pages
	await snapshot();
	await press('ArrowRight'); // end title
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowUp');
	await press('ArrowRight');
	await snapshot();
	await press('ArrowDown'); // talk to cat from above
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await end();
});

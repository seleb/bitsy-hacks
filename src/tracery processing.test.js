import {
	end,
	evaluate,
	press,
	snapshot,
	start,
	walkToCat,
} from './test/bitsy';

test('tracery processing', async () => {
	await start({
		hacks: [
			[
				'tracery processing',
				{
					grammar: {
						main: ['tracery text 1', 'tracery text 2', 'tracery text 3', 'tracery text 4'],
					},
				},
			],
		],
		catDialog: '#main#',
	});
	await walkToCat();
	await evaluate(() => {
		Math.random = () => 0;
	});
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter');
	await evaluate(() => {
		Math.random = () => 0.99;
	});
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

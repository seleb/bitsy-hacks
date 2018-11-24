import {
	start,
	walkToCat,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('p', async () => {
	await start({
		catDialog: 'paragraph 1(p)paragraph 2',
		hacks: ['paragraph-break'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // next dialog page
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // end dialog
	await snapshot();
	await end();
});

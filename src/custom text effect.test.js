import {
	start,
	walkToCat,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('strike', async () => {
	await start({
		catDialog: '{strike}strike{strike}{br}custom text effect',
		hacks: ['custom text effect'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

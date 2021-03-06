import {
	start,
	walkToCat,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('with ending text', async () => {
	await start({
		catDialog: '{end}this is an ending',
		hacks: ['close on ending'],
	});
	await walkToCat();
	await press('ArrowRight');
	await press('Enter');
	await snapshot();
	await press('Enter');
	await press('Enter');
	await snapshot();
	await end();
});

test('without ending text', async () => {
	await start({
		catDialog: '{end}',
		hacks: ['close on ending'],
	});
	await walkToCat();
	await press('ArrowRight');
	await press('Enter');
	await snapshot();
	await end();
});

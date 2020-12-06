import {
	start,
	walkToCat,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('long dialog', async () => {
	await start({
		hacks: ['long dialog'],
		catDialog: 'Test{PG}Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean aliquet neque quis volutpat interdum. Aenean blandit volutpat maximus. Nam lectus purus, convallis nec finibus sit amet, malesuada eu nisl.',
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // next dialog page
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // next dialog page
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

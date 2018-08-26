import {
	start,
	walkToCat,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('transparent dialog', async () => {
	await start({
		hacks: ['transparent dialog'],
	});
	await walkToCat();
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

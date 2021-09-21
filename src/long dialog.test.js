import { end, press, snapshot, start, walkToCat } from './test/bitsy';

test('long dialog', async () => {
	await start({
		hacks: ['long dialog'],
		catDialog:
			'Test{p}Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean aliquet neque quis volutpat interdum. Aenean blandit volutpat maximus. Nam lectus purus, convallis nec finibus sit amet, malesuada eu nisl.',
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // next dialog page
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // next dialog page
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await end();
});

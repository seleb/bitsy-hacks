import {
	start,
	walkToCat,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('textbox styler', async () => {
	await start({
		hacks: ['textbox styler'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

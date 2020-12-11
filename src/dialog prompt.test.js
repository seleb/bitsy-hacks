import {
	start,
	walkToCat,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('dialog prompt', async () => {
	await start({
		catDialog: 'Who am I? {prompt "name,cat"}{p}I\'m a {say name}',
		hacks: ['dialog prompt'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog
	await snapshot();
	await press('Backspace');
	await press('Backspace');
	await press('o');
	await press('o');
	await press('l');
	await press(' ');
	await press('c');
	await press('a');
	await press('t');
	await snapshot();
	await press('Enter'); // submit
	await press('Enter'); // complete dialog
	await snapshot();
	await end();
});

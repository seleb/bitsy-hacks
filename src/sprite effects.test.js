import {
	end, press, snapshot, start, walkToCat,
} from './test/bitsy';

test('sprite effects', async () => {
	await start({
		catDialog: '\\(spriteEffect "SPR,A,invert"\\){spriteEffect "SPR,A,invert"}',
		hacks: [
			'sprite effects',
		],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await press('Enter'); // end dialog
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await press('Enter'); // end dialog
	await snapshot();
	await end();
});

test('compatible with transparency', async () => {
	await start({
		catDialog: '\\(spriteEffect "SPR,A,invert"\\){spriteEffect "SPR,A,invert"}',
		hacks: [
			'transparent sprites',
			'sprite effects',
		],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await press('Enter'); // end dialog
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await press('Enter'); // end dialog
	await snapshot();
	await end();
});

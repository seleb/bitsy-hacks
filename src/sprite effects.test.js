import { press, snapshot, start, walkToCat } from './test/bitsy';

test('sprite effects', async () => {
	await start({
		catDialog: '\\(spriteEffect "SPR,A,invert"\\){spriteEffect "SPR,A,invert"}',
		hacks: ['sprite effects'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await press('ArrowRight'); // end dialog
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await press('ArrowRight'); // end dialog
	await snapshot();
});

test('compatible with transparency', async () => {
	await start({
		catDialog: '\\(spriteEffect "SPR,A,invert"\\){spriteEffect "SPR,A,invert"}',
		hacks: ['transparent sprites', 'sprite effects'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await press('ArrowRight'); // end dialog
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await press('ArrowRight'); // end dialog
	await snapshot();
});

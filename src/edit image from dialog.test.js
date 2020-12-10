import {
	end,
	press,
	snapshot,
	start,
	walkToCat,
} from './test/bitsy';

test('image', async () => {
	await start({
		catDialog: '(image "2" "A"){image "2" "A"}',
		hacks: ['edit image from dialog'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // end dialog
	await snapshot();
	await end();
});

test('imageNow', async () => {
	await start({
		catDialog: '(imageNow "2" "A"){imageNow "2" "A"}',
		hacks: ['edit image from dialog'],
	});
	await walkToCat();
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

test('compatible with transparency', async () => {
	await start({
		catDialog: '(imageNow "A" "2"){imageNow "A" "2"}',
		hacks: ['edit image from dialog', 'transparent sprites'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await press('Enter'); // close dialog
	await press('ArrowDown');
	await press('ArrowDown'); // walk on top of tile border
	await snapshot();
	await end();
});

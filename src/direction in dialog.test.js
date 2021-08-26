import {
	start,
	walkToCat,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('direction in dialog', async () => {
	await start({
		hacks: ['direction in dialog'],
		catDialog: `"""
{
  - playerDirection == "up" ?
    i'm a cat above you
  - playerDirection == "left" ?
    i'm a cat to the left of you
  - playerDirection == "right" ?
    i'm a cat to the right of you
  - playerDirection == "down" ?
    i'm a cat below you
  - else ?
    i'm a cat but the hack didn't work
}
"""`,
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat from the right
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // close dialog page

	await press('ArrowUp');
	await press('ArrowRight');
	await press('ArrowDown'); // talk to cat from above
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // close dialog page

	await press('ArrowRight');
	await press('ArrowDown');
	await press('ArrowLeft'); // talk to cat from the left
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // close dialog page

	await press('ArrowDown');
	await press('ArrowLeft');
	await press('ArrowUp'); // talk to cat from below
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await end();
});

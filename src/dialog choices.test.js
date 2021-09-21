import { end, press, snapshot, start, walkToCat } from './test/bitsy';

test('dialog choices', async () => {
	await start({
		catDialog: `"""
{choice
  - text after
    test a
  - no text after
}
"""`,
		hacks: ['dialog choices'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // select first choice
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat again
	await press('ArrowRight'); // complete dialog page
	await press('ArrowDown'); // highlight second choice
	await snapshot();
	await press('ArrowRight'); // select second choice
	await snapshot();
	await end();
});

test('dialog in front', async () => {
	await start({
		catDialog: `"""
I'm a cat{choice
  - text after
    test a
  - no text after
}
"""`,
		hacks: ['dialog choices'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await press('ArrowRight'); // next page
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // select first choice
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await end();
});

test('with long dialog', async () => {
	await start({
		catDialog: `"""
{choice
  - text after
    test a
  - no text after
  - text after 2
    test b
}
"""`,
		hacks: ['long dialog', 'dialog choices'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await press('ArrowDown'); // highlight second choice
	await press('ArrowDown'); // highlight third choice
	await snapshot();
	await press('ArrowRight'); // select third choice
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await end();
});

import {
	end,
	press,
	snapshot,
	start,
	walkToCat,
} from './test/bitsy';

test('not equals', async () => {
	await start({
		hacks: ['logic-operators-extended'],
		catDialog: `"""
{a = 1}{print a} !== 1 = {
  - a !== 1 ?
    true
  - else ?
    false
}
{a = 0}{print a} !== 1 = {
	- a !== 1 ?
	  true
	- else ?
	  false
  }
"""`,
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

test('and', async () => {
	await start({
		hacks: ['logic-operators-extended'],
		catDialog: `"""
{a = 1}{b = 2}{print a} == 1 && {print b} == 2 = {
  - a == 1 && b == 2 ?
    true
  - else ?
    false
}
{a = 0}{b = 2}{print a} == 1 && {print b} == 2 = {
	- a == 1 && b == 2 ?
	  true
	- else ?
	  false
  }
"""`,
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

test('or', async () => {
	await start({
		hacks: ['logic-operators-extended'],
		catDialog: `"""
{a = 0}{b = 2}{print a} == 1 || {print b} == 2 = {
  - a == 1 || b == 2 ?
    true
  - else ?
    false
}
{a = 1}{b = 1}{print a} == 1 || {print b} == 2 = {
	- a == 1 || b == 2 ?
	  true
	- else ?
	  false
  }
"""`,
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

test('modulo', async () => {
	await start({
		hacks: ['logic-operators-extended'],
		catDialog: `"""
{a = 5}{b = 3}{c = a % b}{print a} % {print b} = {print c}
"""`,
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

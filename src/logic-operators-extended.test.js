import { press, snapshot, start, walkToCat } from './test/bitsy';

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
	await press('ArrowRight'); // complete dialog page
	await snapshot();
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
	await press('ArrowRight'); // complete dialog page
	await snapshot();
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
	await press('ArrowRight'); // complete dialog page
	await snapshot();
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
	await press('ArrowRight'); // complete dialog page
	await snapshot();
});

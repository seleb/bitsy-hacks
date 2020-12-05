import {
	end,
	press,
	snapshot,
	start,
	walkToCat,
} from './test/bitsy';

test('and', async () => {
	await start({
		hacks: ['logic-operators-extended'],
		catDialog: `{>>
{SET a 1}{SET b 2}{SAY a} == 1 && {SAY b} == 2 = 
	{IF
		{AND {IS a 1} {IS b 2}}
			{>> true}
		{>> false}
	}
{BR}
{SET a 0}{SET b 2}{SAY a} == 1 && {SAY b} == 2 = 
	{IF
		{AND {IS a 1} {IS b 2}}
			{>> true}
		{>> false}
	}
}`,
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
		catDialog: `{>>
{SET a 0}{SET b 2}{SAY a} == 1 || {SAY b} == 2 = 
	{IF
		{OR {IS a 1} {IS b 2}}
			{>> true}
		{>> false}
	}
{BR}
{SET a 1}{SET b 1}{SAY a} == 1 || {SAY b} == 2 = 
	{IF
		{OR {IS a 1} {IS b 2}}
			{>> true}
		{>> false}
	}
}`,
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
		catDialog: `{>>
{SET a 5}{SET b 3}{SET c {MOD a b}}{SET d {MOD b a}}
{SAY a} % {SAY b} = {SAY c}
{BR}
{SAY b} % {SAY a} = {SAY d}
}`,
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

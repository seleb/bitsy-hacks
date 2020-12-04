import {
	end,
	evaluate,
	press,
	snapshot,
	start,
} from './test/bitsy';

const gamedata = `

# BITSY VERSION 8.0
# DEVELOPMENT BUILD -- BETA
! ROOM_FORMAT 0
! PAL_FORMAT 1

PAL 1
0052CC
809FFF
FFFFFF

ROOM 1
0000000000000000
0111111111111110
0100000000000010
0100000000000010
0100000000000010
0100000000000010
0100000000000010
0100000000000010
0100000000000010
0100000000000010
0100000000000010
0100000000000010
0100000A20000010
0100000000000010
0111111111111110
0000000000000000
PAL 1

TIL 1
11111111
10000001
10000001
10011001
10011001
10000001
10000001
11111111

SPR 2
00000000
00000000
01010001
01110001
01110010
01111100
00111100
00100100
NAME cat
DLG 1

AVA A
00011000
00011000
00011000
00111100
01111110
10111101
00100100
00100100
BTN 2

DLG 1
{>>
	{IF
		{IS DIR "RGT"}
			{>> i'm a cat to the right of you}
		{IS DIR "LFT"}
			{>> i'm a cat to the left of you}
		{IS DIR "UP"}
			{>> i'm a cat above you}
		{IS DIR "DWN"}
			{>> i'm a cat below you}
	}
}

CUE 2
{FN {BTN}
	{IF
		{IS BTN "OK"}
			{>> }
		{SET DIR BTN}
	}
}

`;

test('direction in dialog', async () => {
	await start({
		gamedata,
	});
	await evaluate('console.log = () => {};');
	await press('ArrowRight'); // talk to cat from the right
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // close dialog page

	await press('ArrowUp');
	await press('ArrowRight');
	await press('ArrowDown'); // talk to cat from above
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // close dialog page

	await press('ArrowRight');
	await press('ArrowDown');
	await press('ArrowLeft'); // talk to cat from the left
	await press('Enter'); // complete dialog page
	await snapshot();
	await press('Enter'); // close dialog page

	await press('ArrowDown');
	await press('ArrowLeft');
	await press('ArrowUp'); // talk to cat from below
	await press('Enter'); // complete dialog page
	await snapshot();
	await end();
});

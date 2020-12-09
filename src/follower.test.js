import {
	end,
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
NAME blueprint

ROOM 1
0000000000000000
0111111111111110
0100000000000010
0100000000000010
0100A00000000010
0100000000000010
0100000000000010
0100000000000010
0100000000000010
0100000000000010
0100000000000010
0100000000000010
0100000000000010
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
NAME block

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
BTN 9

AVA A
00011000
00011000
00011000
00111100
01111110
10111101
00100100
00100100
BTN 8

DLG 1
{>>
    {: THIS placed NO}
    I'm a follower
}
NAME cat dialog

CUE 8
{FN {BTN}
    {IF
        {IS {: THIS follower} NO}
            {>>
                {: THIS follower "2"}
            }
    }
    {IF
        {ISNT BTN "OK"}
            {>>
                {SET X {: THIS X}}
                {SET Y {: THIS Y}}
                {PUT {: THIS follower} X Y}
            }
    }
}

CUE 9
{FN {BTN}
    {IF
        {IS BTN "OK"}
            {>>}
        {IS {: THIS placed} YES}
            {>>
                {RID THIS}
            }
        {>>
            {: THIS placed YES}
        }
    }
}
`;

test('follower', async () => {
	await start({
		hacks: ['follower'],
		gamedata,
	});
	await press('ArrowLeft');
	await press('ArrowLeft');
	await press('ArrowLeft'); // walk on top of tile border
	await snapshot();
	await end();
});

import {
	end,
	press,
	snapshot,
	start,
	walkToCat,
} from './test/bitsy';

test('deferred', async () => {
	await start({
		gamedata: `

# BITSY VERSION 7.0

! ROOM_FORMAT 1

PAL 0
0,82,204
128,159,255
255,255,255

ROOM 0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,a,a,a,a,a,a,a,a,a,a,a,a,a,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,a,a,a,a,a,a,a,a,a,a,a,a,a,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
PAL 0

TIL a
11111111
10000001
10000001
10011001
10011001
10000001
10000001
11111111

SPR A
00011000
00011000
00011000
00111100
01111110
10111101
00100100
00100100
POS 0 4,4

SPR a
00000000
00000000
01010001
01110001
01110010
01111100
00111100
00100100
DLG SPR_0
POS 0 8,12

DLG SPR_0
I'm a cat{jump "ITM_0"}

DLG ITM_0
You found a nice warm cup of tea

VAR a
42

`,
		hacks: ['dialog jump'],
	});
	await walkToCat();
	await press('ArrowRight');
	await press('ArrowRight');
	await snapshot();
	await press('ArrowRight');
	await press('ArrowRight');
	await snapshot();
	await end();
});

test('now', async () => {
	await start({
		gamedata: `

# BITSY VERSION 7.0

! ROOM_FORMAT 1

PAL 0
0,82,204
128,159,255
255,255,255

ROOM 0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,a,a,a,a,a,a,a,a,a,a,a,a,a,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,a,0
0,a,a,a,a,a,a,a,a,a,a,a,a,a,a,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
PAL 0

TIL a
11111111
10000001
10000001
10011001
10011001
10000001
10000001
11111111

SPR A
00011000
00011000
00011000
00111100
01111110
10111101
00100100
00100100
POS 0 4,4

SPR a
00000000
00000000
01010001
01110001
01110010
01111100
00111100
00100100
DLG SPR_0
POS 0 8,12

DLG SPR_0
I'm a cat{jumpNow "ITM_0"}

DLG ITM_0
You found a nice warm cup of tea

VAR a
42

`,
		hacks: ['dialog jump'],
	});
	await walkToCat();
	await press('ArrowRight');
	await press('ArrowRight');
	await snapshot();
	await end();
});

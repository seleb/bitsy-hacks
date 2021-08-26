import {
	start,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('multi-sprite avatar', async () => {
	await start({
		gamedata: `
Write your game's title here

# BITSY VERSION 5.1

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

SPR c
00000000
01111110
01111110
01111110
01111110
01111010
01111110
00000000
DLG SPR_0
POS 0 8,12

SPR d
00000000
01111110
01111110
01111110
01111110
01011110
01111110
00000000
DLG SPR_0
POS 0 8,12

SPR e
00000000
01111110
01111010
01111110
01111110
01111110
01111110
00000000
DLG SPR_0
POS 0 8,12

SPR f
00000000
01111110
01011110
01111110
01111110
01111110
01111110
00000000
DLG SPR_0
POS 0 8,12

ITM 0
00000000
00000000
00000000
00111100
01100100
00100100
00011000
00000000
NAME tea
DLG ITM_0

DLG SPR_0
I'm a cat

DLG ITM_0
You found a nice warm cup of tea

VAR a
42


`,
		hacks: ['multi-sprite avatar'],
	});
	await press('ArrowRight'); // complete title dialog
	await press('ArrowRight'); // end dialog
	await snapshot();
	await press('ArrowRight'); // move
	await snapshot();
	await end();
});

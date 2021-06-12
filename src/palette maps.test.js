import {
	start,
	end,
	snapshot,
} from './test/bitsy';

test('palette maps', async () => {
	await start({
		hacks: ['palette maps'],
		gamedata: `

# BITSY VERSION 7.0

! ROOM_FORMAT 1

PAL 0
0,82,204
128,159,255
255,255,255

PAL 1
255,82,204
255,159,255
0,255,255

ROOM 100
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
POS 100 4,4

SPR a
00000000
00000000
01010001
01110001
01110010
01111100
00111100
00100100
DLG 0
POS 100 8,12

ITM 0
00000000
00000000
00000000
00111100
01100100
00100100
00011000
00000000
`,
	});
	await snapshot();
	await end();
});
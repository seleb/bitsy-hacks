import { end, press, snapshot, start } from './test/bitsy';

const gamedata = `
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
00111110
00111101
00100100
00100100
POS 0 4,4

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


`;

test('directional avatar', async () => {
	await start({
		gamedata,
		hacks: ['directional avatar'],
	});
	await press('ArrowRight'); // complete title dialog
	await press('ArrowRight'); // end dialog
	await snapshot();
	await press('ArrowLeft'); // move
	await snapshot();
	await press('ArrowRight'); // move
	await snapshot();
	await end();
});

test('compatible with transparency', async () => {
	await start({
		gamedata,
		hacks: ['directional avatar', 'transparent sprites'],
	});
	await press('ArrowRight'); // complete title dialog
	await press('ArrowRight'); // end dialog
	await press('ArrowLeft');
	await press('ArrowLeft');
	await press('ArrowLeft'); // walk on top of tile border
	await snapshot();
	await press('ArrowLeft');
	await press('ArrowRight'); // walk on top of tile border from other side
	await snapshot();
	await end();
});

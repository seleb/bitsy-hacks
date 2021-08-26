import {
	end, evaluate, press, snapshot, start,
} from './test/bitsy';

const gamedata = `Write your game's title here

# BITSY VERSION 5.3

! ROOM_FORMAT 1

PAL 0
0,82,204
128,159,255
255,255,255

PAL 1
0,0,0
255,255,255
255,43,234

ROOM 0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,a,0,0,0,0,0,0,0,0,0,0,0,0,0
0,a,a,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,a,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,a,0,0,0,0,0,0,0,0,0,0,0,0,0
0,a,a,a,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
EXT 0,0 1 0,0
PAL 0

ROOM 1
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,a,a,a,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,a,0,0,0,0,0,0,0,0,0,0,0,0
0,a,a,a,0,0,0,0,0,0,0,0,0,0,0,0
0,a,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,a,a,a,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
PAL 1

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

test('dynamic background', async () => {
	await start({
		gamedata,
		hacks: ['dynamic background'],
	});
	await evaluate('document.getElementById("game").style.transform = "scale(0.5)";');
	await press('ArrowRight');
	await press('ArrowRight'); // complete title dialog
	await press('ArrowUp');
	await press('ArrowUp');
	await press('ArrowUp');
	await press('ArrowUp');
	await press('ArrowLeft');
	await press('ArrowLeft');
	await press('ArrowLeft'); // walk to exit
	await snapshot();
	await press('ArrowLeft'); // walk through exit
	await snapshot();
	await end();
});

describe('hackOptions', () => {
	test('default', async () => {
		await start({
			gamedata,
			hacks: [['dynamic background', {
				default: 1,
				byRoom: {},
			}]],
		});
		await evaluate('document.getElementById("game").style.transform = "scale(0.5)";');
		await press('ArrowRight');
		await press('ArrowRight'); // complete title dialog
		await press('ArrowUp');
		await press('ArrowUp');
		await press('ArrowUp');
		await press('ArrowUp');
		await press('ArrowLeft');
		await press('ArrowLeft');
		await press('ArrowLeft'); // walk to exit
		await snapshot();
		await press('ArrowLeft'); // walk through exit
		await snapshot();
		await end();
	});

	test('byRoom', async () => {
		await start({
			gamedata,
			hacks: [['dynamic background', {
				default: 0,
				byRoom: {
					1: 2,
				},
			}]],
		});
		await evaluate('document.getElementById("game").style.transform = "scale(0.5)";');
		await press('ArrowRight');
		await press('ArrowRight'); // complete title dialog
		await press('ArrowUp');
		await press('ArrowUp');
		await press('ArrowUp');
		await press('ArrowUp');
		await press('ArrowLeft');
		await press('ArrowLeft');
		await press('ArrowLeft'); // walk to exit
		await snapshot();
		await press('ArrowLeft'); // walk through exit
		await snapshot();
		await end();
	});
});

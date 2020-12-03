import {
	end, evaluate, press, snapshot, start,
} from './test/bitsy';

const gamedata = `
Write your game's title here

# BITSY VERSION 8.0
# DEVELOPMENT BUILD -- BETA
! ROOM_FORMAT 0
! PAL_FORMAT 1

PAL 1
0052CC
809FFF
FFFFFF
NAME blueprint

PAL 2
000000
FFFFFF
FF2BEA
NAME test

ROOM 1
6000000000000000
00a0000000000000
0aa0000000000000
00a0A00000000000
00a0000000000000
0aaa000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000020000000
0000000000000000
0000000000000000
0000000000000000
PAL 1

ROOM 2
0000000000000000
0aaa000000000000
000a000000000000
0aaa000000000000
0a00000000000000
0aaa000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
PAL 2

SPR 2
00000000
00000000
01010001
01110001
01110010
01111100
00111100
00100100
DLG SPR_0

EXT 6
00000000
00000000
00000000
00000000
00000000
00000000
00000000
00000000
OUT 2 0 0

TIL a
11111111
10000001
10000001
10011001
10011001
10000001
10000001
11111111

AVA A
00011000
00011000
00011000
00111100
01111110
10111101
00100100
00100100

DLG SPR_0
I'm a cat

VAR a
42
`;

test('dynamic background', async () => {
	await start({
		gamedata,
		hacks: ['dynamic background'],
	});
	await evaluate('document.getElementById("game").style.transform = "scale(0.5)";');
	await press('Enter');
	await press('Enter'); // complete title dialog
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
		await press('Enter');
		await press('Enter'); // complete title dialog
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
					2: 2,
				},
			}]],
		});
		await evaluate('document.getElementById("game").style.transform = "scale(0.5)";');
		await press('Enter');
		await press('Enter'); // complete title dialog
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

import { delay, press, snapshot, start, waitForFrame } from './test/bitsy';

const multiple = `

# BITSY VERSION 7.2

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
POS 0 4,12

SPR a
00000000
00000000
00001000
00011000
00001000
00001000
00011100
00000000
POS 0 6,12

SPR b
00000000
00000000
00011000
00100100
00001000
00010000
00111100
00000000
POS 0 8,12
`;

test('follower', async () => {
	await start({
		hacks: ['follower'],
	});
	await waitForFrame();
	await press('ArrowRight'); // complete title page
	await press('ArrowRight'); // end title page
	await press('ArrowLeft');
	await press('ArrowLeft');
	await press('ArrowLeft'); // walk on top of tile border
	await delay(1000); // wait for follower to catch up
	await snapshot();
});

test('multiple followers (chain)', async () => {
	await start({
		hacks: [
			[
				'follower',
				{
					allowFollowerCollision: false,
					followers: ['a', 'b'],
					delay: 1,
				},
			],
		],
		gamedata: multiple,
	});
	await waitForFrame();
	await press('ArrowLeft');
	await snapshot();
	await press('ArrowLeft');
	await snapshot();
});

test('multiple followers (stack)', async () => {
	await start({
		hacks: [
			[
				'follower',
				{
					allowFollowerCollision: false,
					followers: ['a', 'b'],
					delay: 1,
					stack: true,
				},
			],
		],
		gamedata: multiple,
	});
	await waitForFrame();
	await press('ArrowLeft');
	await snapshot();
	await press('ArrowLeft');
	await snapshot();
});

test('through exits', async () => {
	await start({
		gamedata: `

# BITSY VERSION 7.2

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
NAME example room
EXT 0,0 1 0,0
PAL 0

ROOM 1
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
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
EXT 0,0 0 0,0
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
NAME block

SPR A
00011000
00011000
00011000
00111100
01111110
10111101
00100100
00100100
POS 0 2,0

SPR a
00000000
00000000
01010001
01110001
01110010
01111100
00111100
00100100
NAME cat
DLG 0
POS 0 3,0

DLG 0
"""
{follower "a"}
"""
NAME cat dialog

`,
		hacks: [
			[
				'follower',
				{
					allowFollowerCollision: true,
					followers: ['a'],
					delay: 0,
				},
			],
		],
	});
	await waitForFrame();
	await press('ArrowLeft'); // next to exit
	await snapshot();
	await press('ArrowLeft'); // through exit
	await press('ArrowRight'); // next to exit
	await snapshot();
	await press('ArrowRight'); // 2 steps from exit
	await press('ArrowLeft'); // turn off follower
	await press('ArrowDown');
	await press('ArrowLeft');
	await press('ArrowLeft');
	await press('ArrowUp'); // through exit
	await press('ArrowRight'); // next to exit
	await snapshot();
});

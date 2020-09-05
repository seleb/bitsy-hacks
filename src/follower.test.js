import {
	start,
	press,
	end,
	snapshot,
	delay,
} from './test/bitsy';

		snapshot, start
	} from './test/bitsy';

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
	await press('Enter'); // complete title page
	await press('Enter'); // end title page
	await press('ArrowLeft');
	await press('ArrowLeft');
	await press('ArrowLeft'); // walk on top of tile border
	await delay(500); // wait for follower to catch up
	await snapshot();
	await end();
});

test('multiple followers (chain)', async () => {
	await start({
		hacks: [['follower', {
			allowFollowerCollision: false,
			followers: ['a', 'b'],
			delay: 1,
		}]],
		gamedata: multiple,
	});
	await press('ArrowLeft');
	await snapshot();
	await press('ArrowLeft');
	await snapshot();
	await end();
});

test('multiple followers (stack)', async () => {
	await start({
		hacks: [['follower', {
			allowFollowerCollision: false,
			followers: ['a', 'b'],
			delay: 1,
			stack: true,
		}]],
		gamedata: multiple,
	});
	await press('ArrowLeft');
	await snapshot();
	await press('ArrowLeft');
	await snapshot();
	await end();
});

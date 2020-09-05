import {
	start,
	press,
	end,
	snapshot,
	delay,
} from './test/bitsy';

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

test('multiple followers', async () => {
	await start({
		hacks: [['follower', {
			allowFollowerCollision: false,
			followers: ['a', 'b'],
			delay: 1,
		}]],
		gamedata: `

# BITSY VERSION 7.2

! ROOM_FORMAT 1

PAL 0
NAME blueprint
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
NAME cat
DLG 0
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
DLG 1

ITM 1
00000000
00111100
00100100
00111100
00010000
00011000
00010000
00011000
NAME key
DLG 2

DLG 0
I'm a cat
NAME cat dialog

DLG 1
You found a nice warm cup of tea
NAME tea dialog

DLG 2
A key! {wvy}What does it open?{wvy}
NAME key dialog

VAR a
42

`,
	});
	await snapshot();
	await press('ArrowLeft');
	await press('ArrowLeft');
	await press('ArrowLeft'); // walk on top of tile border
	await delay(500); // wait for follower to catch up
	await snapshot();
	await end();
});

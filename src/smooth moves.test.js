import { delay, press, snapshot, start } from './test/bitsy';

test('smooth moves', async () => {
	await start({
		hacks: [
			[
				'smooth moves',
				{
					duration: 1000,
					delta: 1.5,
					ease: function (t) {
						return t;
					},
				},
			],
		],
		gamedata: `

# BITSY VERSION 7.10

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
ITM 0 8,5
ITM 0 10,5
EXT 6,4 0 7,4
EXT 8,4 0 8,4
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
11111111
11111111
11111111
11111111
11111111
11111111
11111111
11111111
POS 0 4,4

ITM 0
00000000
00000000
00000000
00011000
00011000
00000000
00000000
00000000
DLG 0

DLG 0
"""
{sequence
  - {exit "0" 10 4}
  - {exit "0" 11 4}
}
"""
NAME item 0 dialog

VAR a
42

`,
	});
	const fuzzyMatch = { failureThreshold: 8 };
	await snapshot();
	await press('ArrowRight');
	// ease
	await delay(450);
	await snapshot(fuzzyMatch);
	await delay(600);
	await snapshot();
	// no ease over far exit
	await press('ArrowRight');
	await snapshot();
	// ease over near exit
	await press('ArrowRight');
	await delay(450);
	await snapshot(fuzzyMatch);
	await delay(600);
	await snapshot();
	// no ease over far dialog exit
	await press('ArrowDown');
	await snapshot();
	// ease over near dialog exit
	await press('ArrowDown');
	await delay(450);
	await snapshot(fuzzyMatch);
	await delay(600);
	await snapshot();
});

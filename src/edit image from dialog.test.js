import { press, snapshot, start, walkToCat } from './test/bitsy';

test('image', async () => {
	await start({
		catDialog: '\\(image "SPR, a, A"\\)(image "SPR, a, A")',
		hacks: ['edit image from dialog'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
	await press('ArrowRight'); // end dialog
	await snapshot();
});

test('imageNow', async () => {
	await start({
		catDialog: '\\(imageNow "SPR, a, A"\\)(imageNow "SPR, a, A")',
		hacks: ['edit image from dialog'],
	});
	await walkToCat();
	await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await snapshot();
});

test('compatible with transparency', async () => {
	await start({
		catDialog: '\\(imageNow "SPR, A, a"\\)(imageNow "SPR, A, a")',
		hacks: ['edit image from dialog', 'transparent sprites'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await press('ArrowRight'); // close dialog
	await press('ArrowDown');
	await press('ArrowDown'); // walk on top of tile border
	await snapshot();
});

test('compatible with extended palette', async () => {
	await start({
		gamedata: `

# BITSY VERSION 7.10

! ROOM_FORMAT 1

PAL 0
0,82,204
128,159,255
255,255,255
255,0,0

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
POS 0 7,12

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
POS 0 8,12
COL 3

ITM 0
00000000
00000000
00000000
00111100
01100100
00100100
00011000
00000000

DLG 0
\\(imageNow "SPR, a, A"\\)(imageNow "SPR, a, A")
NAME cat dialog

VAR a
42
`,
		hacks: ['edit image from dialog'],
	});
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog page
	await press('ArrowRight'); // close dialog
	await snapshot();
});

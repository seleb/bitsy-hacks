import { end, press, snapshot, start } from './test/bitsy';

const gamedata = `
Write your game's title here

# BITSY VERSION 6.4

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
WAL true

SPR A
00011000
00011000
00011000
00111100
01111110
10111101
00100100
00100100
POS 0 9,13

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
POS 0 10,13

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

test('gravity: jump', async () => {
	await start({
		hacks: ['gravity'],
		gamedata: gamedata,
		catDialog: 'meow (setJumpPower 1)',
	});
	await press('ArrowRight'); // complete title dialog
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	await press('ArrowRight'); // end dialog
	await press('ArrowUp'); // jump up
	await press('ArrowLeft'); // move left, succeed
	await press('ArrowRight'); // try to move right, dall instead
	await snapshot();
	await end();
});

test('gravity: jetpack', async () => {
	await start({
		hacks: ['gravity'],
		gamedata: gamedata,
		catDialog: 'meow (toggleJetpack) (setJumpPower "2")',
	});
	await press('ArrowRight'); // complete title dialog
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	await press('ArrowRight'); // end dialog
	await press('ArrowUp'); // jetpack up
	await press('ArrowLeft'); // move left
	await press('ArrowUp'); // jetpack up
	await press('ArrowUp'); // try to jetpack and fall
	await snapshot(); // snapshot
	await end();
});

test('gravity: force', async () => {
	await start({
		hacks: ['gravity'],
		gamedata: gamedata,
		catDialog: 'meow (forceGravity "up")',
	});
	await press('ArrowRight'); // complete title dialog
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	await press('ArrowRight'); // end dialog
	await press('ArrowLeft'); // attempt to move left, forced up instead
	await press('ArrowLeft'); // attempt to move left, forced up instead
	await press('ArrowLeft'); // attempt to move left, forced up instead
	await press('ArrowLeft'); // attempt to move left, forced up instead
	await press('ArrowLeft'); // attempt to move left, forced up instead
	await press('ArrowLeft'); // attempt to move left, forced up instead
	await press('ArrowLeft'); // attempt to move left, forced up instead
	await press('ArrowLeft'); // attempt to move left, forced up instead
	await press('ArrowLeft'); // attempt to move left, forced up instead
	await press('ArrowLeft'); // attempt to move left, forced up instead
	await press('ArrowLeft'); // attempt to move left, forced up instead
	await press('ArrowLeft'); // move left because player hit a wall
	await snapshot(); // snapshot
	await end();
});

test('gravity: invert', async () => {
	await start({
		hacks: ['gravity'],
		gamedata: gamedata,
		catDialog: 'meow (setGravityDirection "left")',
	});
	await press('ArrowRight'); // complete title dialog
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	await press('ArrowRight'); // end dialog
	await press('ArrowUp'); // move "up"
	await press('ArrowUp'); // move "up"
	await press('ArrowUp'); // move "up"
	await press('ArrowUp'); // move "up"
	await snapshot(); // snapshot
	await end();
});

import { evaluate, press, snapshot, start, startDialog, waitForBlip, waitForFrame, walkToCat } from './test/bitsy';

const saveOptions = {
	autosaveInterval: 2 ** 31 - 1, // HACK: Infinity doesn't stringify correctly
	loadOnStart: false,
	clearOnEnd: false,
	clearOnStart: false,
	position: true,
	variables: true,
	items: true,
	dialog: true,
	key: 'snapshot',
};

test('save', async () => {
	await start({
		hacks: [['save', { ...saveOptions, clearOnStart: true }]],
	});
	await walkToCat();
	await snapshot();
	await startDialog('{save}');
	await press('ArrowLeft');
	await startDialog('{load}');
	await snapshot();
	await press('ArrowLeft');
	await startDialog('{load "title text"}');
	await press('ArrowLeft'); // complete dialog
	await snapshot();
	await press('ArrowLeft'); // end dialog
	await snapshot();
	await press('ArrowLeft');
	await startDialog('{clear}');
	await startDialog('{load}');
	await snapshot();
});

test('loadOnStart', async () => {
	await start({
		title: '',
		hacks: [
			[
				'save',
				{
					...saveOptions,
					loadOnStart: true,
					clearOnStart: false,
				},
			],
		],
	});
	await waitForFrame();
	await snapshot();
	await press('ArrowRight');
	await snapshot();
	await startDialog('{save}');
	await evaluate(() => window.onload());
	await snapshot();
});

test('clearOnStart', async () => {
	await start({
		title: '',
		hacks: [['save', { ...saveOptions, clearOnStart: true }]],
	});
	await waitForFrame();
	await snapshot();
	await press('ArrowRight');
	await snapshot();
	await startDialog('{save}');
	await evaluate(() => window.onload());
	await startDialog('{load}');
	await snapshot();
});

test('clearOnEnd', async () => {
	await start({
		title: '',
		hacks: [['save', { ...saveOptions, clearOnEnd: true }]],
	});
	await waitForFrame();
	await snapshot();
	await press('ArrowRight');
	await snapshot();
	await startDialog('{save}');
	await evaluate(() => window.startEndingDialog({ id: '0' })); // force ending
	await press('ArrowRight'); // complete ending dialog
	await press('ArrowRight'); // close ending dialog
	await startDialog('{load}');
	await snapshot();
});

test('sequence', async () => {
	await start({
		catDialog: `"""
{sequence
  - test 1
  - test 2
  - test 3
}
"""`,
		hacks: [['save', { ...saveOptions, clearOnStart: true }]],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 1
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{save}');
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 2
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 3
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{load}');
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 2
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 3
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{save}');
	await startDialog('{load}');
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 3
	await snapshot();
});

test('cycle', async () => {
	await start({
		catDialog: `"""
{cycle
  - test 1
  - test 2
}
"""`,
		hacks: [['save', { ...saveOptions, clearOnStart: true }]],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 1
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{save}');
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 2
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{load}');
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 2
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 1
	await snapshot();
});

test('shuffle', async () => {
	await start({
		catDialog: `"""
{shuffle
  - test 1
  - test 2
  - test 3
}
"""`,
		hacks: [['save', { ...saveOptions, clearOnStart: true }]],
	});
	await walkToCat();
	// deterministic rng
	await evaluate(() => {
		Math.random = () => 0;
	});
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 1
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{save}');
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 2
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 3
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{load}');
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 2
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	// 3
	await snapshot();
});

test('items + variables', async () => {
	await start({
		hacks: [['save', { ...saveOptions, clearOnStart: true }]],
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
ITM 0 5,4
ITM 0 6,4
ITM 0 7,4
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
NAME cat

ITM 0
00000000
00000000
00000000
00111100
01100100
00100100
00011000
00000000

VAR a
42

`,
	});

	await waitForFrame();
	await press('ArrowRight'); // pick up tea 1
	await press('ArrowRight'); // pick up tea 2
	await startDialog('{a = 5}'); // set variable
	await startDialog('{save}');
	await startDialog('a: {say a}{br}tea: {say {item 0}}');
	await press('ArrowRight'); // complete dialog
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // pick up tea 3
	await startDialog('{a = a+1}'); // increment variable
	await startDialog('a: {say a}{br}tea: {say {item 0}}');
	await press('ArrowRight'); // complete dialog
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{load}');
	await startDialog('a: {say a}{br}tea: {say {item 0}}');
	await press('ArrowRight'); // complete dialog
	await snapshot();
});

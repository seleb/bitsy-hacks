import { evaluate, press, snapshot, start, startDialog, walkToCat } from './test/bitsy';

const saveOptions = {
	autosaveInterval: 99999999999999999, // HACK: Infinity doesn't stringify correctly
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
	await press('ArrowRight'); // complete dialog
	// 1
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{save}');
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	// 2
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	// 3
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{load}');
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	// 2
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	// 3
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{save}');
	await startDialog('{load}');
	await press('ArrowRight'); // talk to cat
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
	await press('ArrowRight'); // complete dialog
	// 1
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{save}');
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	// 2
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{load}');
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	// 2
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
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
	await press('ArrowRight'); // complete dialog
	// 1
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{save}');
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	// 2
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	// 3
	await snapshot();
	await press('ArrowRight'); // end dialog
	await startDialog('{load}');
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	// 2
	await snapshot();
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await press('ArrowRight'); // complete dialog
	// 3
	await snapshot();
});

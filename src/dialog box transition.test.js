import { press, snapshot, start, startDialog } from './test/bitsy';

test('dialog box transition', async () => {
	await start({
		title: '',
		hacks: ['dialog box transition'],
	});
	const fuzzyMatch = { failureThreshold: 0.1, failureThresholdType: 'percent' };
	await snapshot();
	await startDialog('test');
	await press('ArrowRight'); // complete dialog page
	await snapshot(fuzzyMatch);
	await snapshot(fuzzyMatch);
	await snapshot(fuzzyMatch);
	await press('ArrowRight'); // end dialog
	await snapshot(fuzzyMatch);
	await snapshot(fuzzyMatch);
	await snapshot(fuzzyMatch);
});

import { delay, press, snapshot, start, startDialog } from './test/bitsy';

test('dialog box transition', async () => {
	await start({
		title: '',
		hacks: [
			[
				'dialog box transition',
				{
					ease: function (t) {
						return Math.floor(t * 4) / 4;
					},
					duration: 4000,
				},
			],
		],
	});
	const fuzzyMatch = { failureThreshold: 0.1, failureThresholdType: 'percent' };
	await snapshot();
	await startDialog('test');
	await delay(1000);
	await snapshot(fuzzyMatch);
	await delay(1000);
	await snapshot(fuzzyMatch);
	await delay(1000);
	await snapshot(fuzzyMatch);
	await delay(1000);
	await press('ArrowRight'); // end dialog
	await snapshot();
});

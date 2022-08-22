import { delay, snapshot, start, startDialog, waitForFrame } from './test/bitsy';

jest.retryTimes(3);

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
	await waitForFrame();
	const fuzzyMatch = { failureThreshold: 0.1, failureThresholdType: 'percent' };
	await snapshot();
	await startDialog('test');
	await delay(1500);
	await snapshot(fuzzyMatch);
	await delay(1000);
	await snapshot(fuzzyMatch);
	await delay(1000);
	await snapshot(fuzzyMatch);
	await delay(1000);
	await snapshot();
});

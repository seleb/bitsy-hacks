import kebabCase from 'lodash.kebabcase';
import path from 'path';
import { delay, snapshot, start, startDialog, waitForFrame } from './test/bitsy';

jest.retryTimes(3);
const customSnapshotIdentifier = ({ testPath, currentTestName, counter }) => kebabCase(`${path.basename(testPath)}-${currentTestName}-${counter}`);

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
	await snapshot({ customSnapshotIdentifier });
	await startDialog('test');
	await delay(1500);
	await snapshot({ customSnapshotIdentifier, ...fuzzyMatch });
	await delay(1000);
	await snapshot({ customSnapshotIdentifier, ...fuzzyMatch });
	await delay(1000);
	await snapshot({ customSnapshotIdentifier, ...fuzzyMatch });
	await delay(1000);
	await snapshot({ customSnapshotIdentifier });
});

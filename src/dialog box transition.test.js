import kebabCase from 'lodash.kebabcase';
import path from 'path';
import { delay, snapshot, start, startDialog, waitForFrame } from './test/bitsy';

jest.retryTimes(3);
const customSnapshotIdentifier = ({ testPath, currentTestName, counter }) => kebabCase(`${path.basename(testPath)}-${currentTestName}-${counter}-snap`);

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
					duration: 8000,
				},
			],
		],
	});
	await waitForFrame();
	const fuzzyMatch = { failureThreshold: 0.1, failureThresholdType: 'percent' };
	await snapshot({ customSnapshotIdentifier });
	await startDialog('test');
	await delay(3000);
	await snapshot({ customSnapshotIdentifier, ...fuzzyMatch });
	await delay(2000);
	await snapshot({ customSnapshotIdentifier, ...fuzzyMatch });
	await delay(2000);
	await snapshot({ customSnapshotIdentifier, ...fuzzyMatch });
	await delay(2000);
	await snapshot({ customSnapshotIdentifier });
});

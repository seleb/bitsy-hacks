import { evaluate, snapshot, start, startDialog, waitForFrame } from './test/bitsy';

async function gamepadSetDownPressed(pressed) {
	await evaluate(p => {
		window.navigator.getGamepads = () => [
			{
				index: 0,
				connected: true,
				buttons: [
					{
						pressed: p,
					},
				],
				axes: [],
			},
		];
	}, pressed);
}

async function gamepadPressDown() {
	await gamepadSetDownPressed(true);
	await waitForFrame();
	await gamepadSetDownPressed(false);
	await waitForFrame();
}

test('gamepad input', async () => {
	await start({
		hacks: ['gamepad input'],
		title: '',
	});
	await waitForFrame();

	await snapshot();
	// moves
	await gamepadPressDown();
	await snapshot();
	// skips dialog
	await startDialog('test');
	await gamepadPressDown();
	await snapshot();
	// completes dialog
	await gamepadPressDown();
	await snapshot();
});

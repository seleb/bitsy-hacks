import { evaluate, press, snapshot, start, startDialog, waitForFrame } from './test/bitsy';

test('stopwatch', async () => {
	await start({
		hacks: ['stopwatch'],
		title: '',
	});
	await waitForFrame();

	// basic (1:05)
	await evaluate(() => {
		window.Date.now = () => 0;
	});
	await startDialog('{startWatch "timer"}');
	await evaluate(() => {
		window.Date.now = () => 1000 * 65;
	});
	await startDialog('{stopWatch "timer"}');
	await startDialog('{sayWatch "timer"}');
	await press('ArrowRight');
	await snapshot();
	await press('ArrowRight');

	// resume (1:05 + 5s = 1:10)
	await evaluate(() => {
		window.Date.now = () => 0;
	});
	await startDialog('{resumeWatch "timer"}');
	await evaluate(() => {
		window.Date.now = () => 1000 * 5;
	});
	await startDialog('{stopWatch "timer"}');
	await startDialog('{sayWatch "timer"}');
	await press('ArrowRight');
	await snapshot();
	await press('ArrowRight');

	// restart (0:05)
	await evaluate(() => {
		window.Date.now = () => 0;
	});
	await startDialog('{startWatch "timer"}');
	await evaluate(() => {
		window.Date.now = () => 1000 * 5;
	});
	await startDialog('{stopWatch "timer"}');
	await startDialog('{sayWatch "timer"}');
	await press('ArrowRight');
	await snapshot();
});

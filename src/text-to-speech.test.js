import { delay, evaluate, press, start, startDialog, waitForFrame } from './test/bitsy';

function hackTTS() {
	// hack speech synthesis to test tts
	return evaluate(() => {
		window.said = '';
		window.speechSynthesis.speak = utterance => {
			window.said = utterance.text;
			utterance.onend();
		};
	});
}
function said() {
	return evaluate(() => window.said);
}

test('automatic and hurried', async () => {
	await start({
		hacks: ['text-to-speech'],
		title: '',
	});
	await hackTTS();

	await startDialog('test1{pg}test2');
	await waitForFrame();
	expect(await said()).toBe('test1');
	await press('ArrowRight');
	await waitForFrame();
	expect(await said()).toBe('test2');
});

test('non-hurried', async () => {
	await start({
		hacks: [['text-to-speech', { automatic: true, hurried: false }]],
		title: '',
	});
	await hackTTS();

	await startDialog('test1{pg}test2');
	await delay(500); // wait for text to complete
	expect(await said()).toBe('test1');
	await press('ArrowRight');
	await delay(500); // wait for text to complete
	expect(await said()).toBe('test2');
});

test('non-automatic', async () => {
	await start({
		hacks: [['text-to-speech', { automatic: false, hurried: true }]],
		title: '',
	});
	await hackTTS();

	await startDialog('test1{pg}test2{ttsNow "test"}');
	await waitForFrame();
	expect(await said()).toBe('');
	await press('ArrowRight');
	await waitForFrame();
	expect(await said()).toBe('test');
});

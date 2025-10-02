import { delay, evaluate, start, startDialog } from './test/bitsy';

jest.retryTimes(5);

// TODO: make this one not flaky
test.skip('dialog audio vocal synth', async () => {
	async function capture() {
		await evaluate(() => {
			window.log = window.log || [];
			window.log.push([
				window.hacks.dialog_audio_vocal_synth.Glottis.isTouched,
				window.hacks.dialog_audio_vocal_synth.Glottis.UITenseness.toFixed(1),
				window.hacks.dialog_audio_vocal_synth.Tract.velumTarget.toFixed(1),
				window.hacks.dialog_audio_vocal_synth.Glottis.loudness.toFixed(1),
				window.hacks.dialog_audio_vocal_synth.Glottis.vibratoAmount.toFixed(1),
				window.hacks.dialog_audio_vocal_synth.Glottis.UIFrequency.toFixed(0),
				Object.values(window.hacks.dialog_audio_vocal_synth.Tract.targetDiameter)
					.map(i => i.toFixed(1))
					.join(','),
				Object.values(window.hacks.dialog_audio_vocal_synth.Tract.diameter)
					.map(i => i.toFixed(1))
					.join(','),
			]);
		});
	}
	async function advance() {
		await evaluate(() => window.updateSystem()); // manual update
	}
	async function advanceAndCapture() {
		await delay(10);
		await advance();
		await delay(10);
		await advance();
		await delay(10);
		await advance();
		await delay(10);
		await advance();
		await capture();
	}

	await start({
		title: '',
		hacks: ['dialog audio vocal synth'],
	});
	// disable rng
	await evaluate(() => {
		window.Math.random = () => 0.5;
	});
	await delay(1000); // allow lerps to settle

	await evaluate(() => window.clearInterval(window.updateInterval)); // cancel update loop
	await capture();
	await startDialog('qwer');
	await advanceAndCapture();
	await advanceAndCapture();
	await advanceAndCapture();
	await advanceAndCapture();
	await advanceAndCapture();
	expect(await evaluate(() => window.log)).toMatchInlineSnapshot(`
		[
		  [
		    false,
		    "0.6",
		    "1.0",
		    "0.4",
		    "0.0",
		    "440",
		    "0.6,0.6,0.6,0.6,0.6,0.6,0.6,1.1,1.1,1.1,1.1,1.1,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5",
		    "0.6,0.6,0.6,0.6,0.6,0.6,0.6,1.1,1.1,1.1,1.1,1.1,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5",
		  ],
		  [
		    true,
		    "0.6",
		    "0.1",
		    "0.4",
		    "0.0",
		    "440",
		    "0.6,0.6,0.6,0.5,0.5,0.4,0.3,0.5,0.4,0.2,0.1,0.0,0.2,0.3,0.5,0.7,0.9,1.0,1.2,1.4,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6",
		    "0.6,0.6,0.6,0.5,0.5,0.4,0.3,0.5,0.4,0.2,0.1,0.0,0.2,0.3,0.5,0.7,0.9,1.0,1.2,1.4,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6",
		  ],
		  [
		    true,
		    "0.6",
		    "1.0",
		    "0.4",
		    "0.0",
		    "440",
		    "0.6,0.6,0.6,0.6,0.6,0.6,0.6,1.1,1.1,1.1,1.1,1.1,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.6,1.5,1.1,0.8,0.4,0.1,0.3,0.7,1.0,1.4,1.6,1.6,1.6,1.6",
		    "0.6,0.6,0.6,0.5,0.5,0.4,0.3,0.5,0.4,0.2,0.1,0.0,0.2,0.3,0.5,0.7,0.9,1.0,1.2,1.4,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6",
		  ],
		  [
		    true,
		    "0.6",
		    "0.1",
		    "0.4",
		    "0.0",
		    "440",
		    "0.6,0.6,0.6,0.6,0.6,0.6,0.6,1.1,1.1,1.1,1.1,1.1,1.4,1.3,1.1,1.0,0.9,0.8,0.6,0.5,0.4,0.3,0.1,0.3,0.4,0.5,0.7,0.8,0.9,1.0,1.2,1.3,1.4,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6",
		    "0.6,0.6,0.6,0.5,0.5,0.4,0.3,0.5,0.4,0.2,0.1,0.0,0.2,0.3,0.5,0.7,0.9,1.0,1.2,1.4,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6",
		  ],
		  [
		    true,
		    "0.6",
		    "0.1",
		    "0.4",
		    "0.0",
		    "440",
		    "0.6,0.6,0.6,0.6,0.6,0.6,0.6,1.1,1.1,1.1,1.1,1.1,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.4,1.4,1.3,1.3,1.2,1.1,1.1,1.0,1.0,0.9,0.9,0.8,0.8,0.9,0.9,1.0,1.0,1.1,1.2,1.2,1.3,1.4,1.4,1.5,1.6",
		    "0.6,0.6,0.6,0.5,0.5,0.4,0.3,0.5,0.4,0.2,0.1,0.0,0.2,0.3,0.5,0.7,0.9,1.0,1.2,1.4,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6",
		  ],
		  [
		    false,
		    "0.6",
		    "0.1",
		    "0.4",
		    "0.0",
		    "440",
		    "0.6,0.6,0.6,0.6,0.6,0.6,0.6,1.1,1.1,1.1,1.1,1.1,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5",
		    "0.6,0.6,0.6,0.5,0.5,0.4,0.3,0.5,0.4,0.2,0.1,0.0,0.2,0.3,0.5,0.7,0.9,1.0,1.2,1.4,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6",
		  ],
		]
	`);
});

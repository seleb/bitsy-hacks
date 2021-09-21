import { end, evaluate, press, start, startDialog } from './test/bitsy';

const silencemp3 =
	'data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAABQTEFNRTMuMTAwBLkAAAAAAAAAABUgJAaUQQAB4AAAAnFiVpzoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xDEKYPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';

test('bitsymuse', async () => {
	await start({
		hacks: [
			[
				'bitsymuse',
				{
					audio: {
						music1: { src: silencemp3, loop: true },
						music2: { src: silencemp3, loop: true },
						sfx1: { src: silencemp3 },
						sfx2: { src: [silencemp3] },
					},
					musicByRoom: {
						0: 'music1',
					},
					silenceId: 'S',
					resume: false,
				},
			],
		],
	});
	await press('ArrowRight'); // skip title dialog

	// adds audio elements
	expect(await evaluate(() => Array.from(window.document.querySelectorAll('audio')).map(i => i.id))).toEqual(['music1', 'music2', 'sfx1', 'sfx2']);

	// hack audio elements to test playback
	await evaluate(() => {
		function play() {
			this.dataset.playing = true;
		}
		function pause() {
			this.dataset.playing = false;
		}
		Array.from(window.document.querySelectorAll('audio')).forEach(i => {
			i.play = play;
			i.pause = pause;
		});
	});
	await press('ArrowRight'); // complete title dialog

	// music plays
	expect(await evaluate(() => window.document.querySelector('#music1').dataset.playing)).toBe('true');

	// music from dialog + only one music will play at a time
	await startDialog('{music "music2"}');
	expect(await evaluate(() => window.document.querySelector('#music1').dataset.playing)).toBe('false');
	expect(await evaluate(() => window.document.querySelector('#music2').dataset.playing)).toBe('true');

	// multiple sfx can play and do not affect music
	await startDialog('{soundeffect "sfx1"}');
	await startDialog('{soundeffect "sfx2"}');
	expect(await evaluate(() => window.document.querySelector('#music1').dataset.playing)).toBe('false');
	expect(await evaluate(() => window.document.querySelector('#music2').dataset.playing)).toBe('true');
	expect(await evaluate(() => window.document.querySelector('#sfx1').dataset.playing)).toBe('true');
	expect(await evaluate(() => window.document.querySelector('#sfx2').dataset.playing)).toBe('true');

	// silence
	await startDialog('{music "S"}');
	expect(await evaluate(() => window.document.querySelector('#music2').dataset.playing)).toBe('false');

	await end();
});

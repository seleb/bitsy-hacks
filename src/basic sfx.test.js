import { evaluate, press, start, startDialog } from './test/bitsy';

jest.retryTimes(3);

const silencemp3 =
	'data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAABQTEFNRTMuMTAwBLkAAAAAAAAAABUgJAaUQQAB4AAAAnFiVpzoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xDEKYPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';

// TODO: make this one not flaky
test.skip('basic sfx', async () => {
	await start({
		hacks: [
			[
				'basic sfx',
				{
					walk: { src: silencemp3 },
					talk: { src: silencemp3 },
				},
			],
		],
	});
	await press('ArrowRight'); // skip title dialog
	await press('ArrowRight'); // complete title dialog

	// adds audio elements
	expect(await evaluate(() => Array.from(window.document.querySelectorAll('audio')).map(i => i.id))).toEqual(['walk', 'talk']);

	// hack audio elements to test playback
	await evaluate(() => {
		function play() {
			this.dataset.played = parseInt(this.dataset.played || 0, 10) + 1;
		}
		Array.from(window.document.querySelectorAll('audio')).forEach(i => {
			i.play = play;
		});
	});

	// test "walk"
	await press('ArrowRight');
	expect(await evaluate(() => window.document.querySelector('#walk').dataset.played)).toBe('1');
	await press('ArrowRight');
	expect(await evaluate(() => window.document.querySelector('#walk').dataset.played)).toBe('2');

	// test "talk"
	await startDialog('test{pg}test');
	await press('ArrowRight');
	expect(await evaluate(() => window.document.querySelector('#talk').dataset.played)).toBe('1');
	await press('ArrowRight');
	expect(await evaluate(() => window.document.querySelector('#talk').dataset.played)).toBe('2');
});

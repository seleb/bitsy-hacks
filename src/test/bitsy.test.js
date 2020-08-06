// baseline test to make sure that bitsy helpers
// function as expected
import {
	start,
	walkToCat,
	snapshot,
	startRecording,
	stopRecording,
	end,
} from './bitsy';

test('walkToCat moves the player to the left of the cat in the default game', async () => {
	await start();
	await walkToCat();
	await snapshot();
	await end();
});

test('startRecording starts capturing a snapshot after every key press', async () => {
	await start();
	await startRecording();
	await walkToCat();
	await end();
});

test('stopRecording stops capturing a snapshot after every key press', async () => {
	await start();
	await startRecording();
	await stopRecording();
	await walkToCat();
	await snapshot();
	await end();
});

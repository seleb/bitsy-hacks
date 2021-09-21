import { press, snapshot, start, walkToCat } from './test/bitsy';

async function testDialog(dlg) {
	await start({
		catDialog: dlg,
		hacks: ['edit room from dialog'],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await snapshot();
}

test('draw', async () => testDialog('(drawNow "TIL, a, 4, 4, 0")'));
test('drawBox', async () => testDialog('(drawBoxNow "TIL, a, 4, 4, 6, 6, 0")'));
test('drawAll', async () => testDialog('(drawAll "TIL, a, 0")'));
test('erase', async () => testDialog('(eraseNow "TIL, a, 1, 1, 0")'));
test('eraseBox', async () => testDialog('(eraseBoxNow "TIL, a, 1, 1, 2, 2, 0")'));
test('eraseAll', async () => testDialog('(eraseAllNow "TIL, a, 0")'));
test('replace', async () => testDialog('(replaceNow "TIL, a, ITM, 0, 1, 1, 0")'));
test('replaceBox', async () => testDialog('(replaceBoxNow "TIL, a, ITM, 0, 1, 1, 2, 2, 0")'));
test('replaceAll', async () => testDialog('(replaceAllNow "TIL, a, ITM, 0, 0")'));
test('copy', async () => testDialog('(copyNow "TIL, a, 1, 1, 0, 2, 2, 0")'));
test('copyBox', async () => testDialog('(copyBoxNow "TIL, a, 1, 1, 2, 2, 0, 3, 3, 0")'));

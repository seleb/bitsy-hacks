import { delay, evaluate, press, start, waitForBlip, walkToCat } from './test/bitsy';

test('dialog audio', async () => {
	await start({
		hacks: [
			[
				'dialog audio',
				{
					onLetter: function (dialogChar) {
						window.characters = window.characters || [];
						window.characters.push(dialogChar);
					},
				},
			],
		],
	});
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await delay(1500);
	expect(await evaluate(() => window.characters.map(i => i.char).join(''))).toMatchInlineSnapshot(`"Write your game's title hereI'm a cat"`);
	await press('ArrowRight'); // end dialog
	await press('ArrowRight'); // talk to cat
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	expect(await evaluate(() => window.characters.map(i => i.char).join(''))).toMatchInlineSnapshot(`"Write your game's title hereI'm a catI'm a cat"`);
});

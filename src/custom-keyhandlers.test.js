import {
	start,
	end,
	waitForFrame,
	page,
} from './test/bitsy';

test('custom-keyhandlers', async () => {
	await start({
		hacks: ['custom-keyhandlers'],
	});
	const logs = [];
	page.on('console', (message) => logs.push(message.text()));
	await page.keyboard.down('z');
	await waitForFrame();
	expect(logs).toContain('pressed z');
	expect(logs).toContain('held z for 1 frames');
	await waitForFrame();
	expect(logs).toContain('held z for 2 frames'); // note that b/c of async nature, it'll have more than two at this point
	expect(logs).not.toContain('released z');
	await page.keyboard.up('z');
	expect(logs).not.toContain('released z');
	await end();
});

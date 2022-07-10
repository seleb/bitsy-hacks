import { evaluate, snapshot, start, waitForFrame } from './test/bitsy';

function fullscreenFavicon() {
	return evaluate(() => {
		const url = document.querySelector('#favicon').href;
		const image = new Image();
		image.src = url;
		document.body.appendChild(image);
		image.style.position = 'fixed';
		image.style.top = '0';
		image.style.left = '0';
		image.style.width = '100%';
		image.style.height = '100%';
		image.style.imageRendering = 'pixelated';
		// eslint-disable-next-line no-underscore-dangle
		window.bitsy._getCanvas().style.display = 'none';
	});
}

test('favicon-from-sprite', async () => {
	await start({
		hacks: ['favicon-from-sprite'],
	});
	await waitForFrame();
	await fullscreenFavicon();
	await snapshot();
});

test('options', async () => {
	await start({
		hacks: [
			[
				'favicon-from-sprite',
				{
					SPRITE_NAME: 'a',
					PALETTE_ID: 0,
					BG_COLOR_NUM: 1,
					FG_COLOR_NUM: 0,
					PIXEL_PADDING: 4,
					ROUNDED_CORNERS: false,
					FRAME_DELAY: 400,
				},
			],
		],
	});
	await waitForFrame();
	await fullscreenFavicon();
	await snapshot();
});

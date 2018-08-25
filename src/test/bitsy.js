import puppeteer from 'puppeteer';
import {
	resolve
} from 'path';

import {
	readFileSync
} from 'fs';

const template = readFileSync(resolve(__dirname, 'bitsy 5.1.html'), {
	encoding: 'utf8'
});

let browser;
let page;

// start pupeteer
// and configure it for testing a bitsy game
export async function start({
	gamedata = '',
	hacks = [],
} = {}) {
	let game = template;

	// hack update to let jest know when updates happen
	game = game.replace(/(function update\(\) {)/, '$1jestUpdate && jestUpdate();');

	// replace gamedata
	if (gamedata) {
		game = game.replace(/(id="exportedGameData">)[^]*?(<\/script>)/, `$1${gamedata}$2`);
	}

	// add hacks
	if (hacks.length) {
		game = game.replace(/(<\/script>)(?![^]*?<\/script>)[^]*?(<\/head>)/, `$1${
			hacks.map(hack => `
<script>
${
	// import the hack file, making sure not to screw up the regex in the process
	// TODO: async file reads
	readFileSync(resolve(`dist/${hack}.js`), {encoding: 'utf8'}).replace(/\$([0-9]+)/g, '$$$$$1')
}
</script>
`).join('\n')
		}$2`);
	}

	// convert to url
	game = `data:text/html;base64,${Buffer.from(game).toString('base64')}`;

	// setup puppeteer
	browser = await puppeteer.launch({
		headless: true,
	});
	page = await browser.newPage();
	await page.goto(game);
	await page.setViewport({
		width: 256,
		height: 256,
	});
}

// cleanup
export async function end() {
	await browser.close();
	browser = undefined;
	page = undefined;
}

// wait for bitsy to have handled input
export async function waitForFrame() {
	await page.evaluate(() => new Promise(resolve => {
		window.jestUpdate = () => {
			window.jestUpdate = null;
			resolve();
		};
	}));
}

// helper to press a key
// bitsy's key handling is a bit non-standard,
// so can't use the built-in puppeteer press reliably
export async function press(key) {
	await page.keyboard.down(key);
	await waitForFrame();
	await page.keyboard.up(key);
	await waitForFrame();
};

// take a screenshot of the current frame
// and perform a snapshot test on it
export async function snapshot() {
	const screenshot = await page.screenshot();
	expect(screenshot).toMatchImageSnapshot();
}


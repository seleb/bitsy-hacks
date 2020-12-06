import puppeteer from 'puppeteer';
import {
	resolve,
} from 'path';

import fs from 'fs';
import util from 'util';

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

let template;
let hackDist;

async function loadResources() {
	if (template && hackDist) {
		return;
	}
	[template, hackDist] = await Promise.all([getHackTemplate(), getHackDist()]);
}

async function getHackDist() {
	const files = await readdir('./dist/');

	const fileContents = await Promise.all(files.map((file) => readFile(`./dist/${file}`, {
		encoding: 'utf8',
	})));

	const fileMap = files.reduce((result, file, idx) => ({
		...result,
		[file.match(/(.+)\.js$/)[1]]: fileContents[idx],
	}), {});
	return fileMap;
}

async function getHackTemplate() {
	return readFile(resolve(__dirname, 'bitsy 7.2.html'), {
		encoding: 'utf8',
	});
}

export let browser;
export let page;
let recording = false;

// simple delay helper
export function delay(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

// start puppeteer
// and configure it for testing a bitsy game
export async function start({
	gamedata = '',
	catDialog = '',
	hacks = [],
} = {}) {
	await loadResources();
	let game = template;

	// hack update to let jest know when updates happen
	game = game.replace(/(function update\(\) {)/, '$1window.jestUpdate && window.jestUpdate();');

	// replace gamedata
	if (gamedata) {
		game = game.replace(/(id="exportedGameData">)[^]*?(<\/script>)/, `$1${gamedata}$2`);
	}

	// replace cat dialog
	if (catDialog) {
		game = game.replace(/I'm a cat/, catDialog);
	}

	// add hacks
	if (hacks.length) {
		game = game.replace(/(<\/script>)(?![^]*?<\/script>)[^]*?(<\/head>)/, `$1${
			hacks.map((hack) => {
				if (typeof hack === 'string') {
					// make sure not to screw up the regex in the process
					return `<script>${hackDist[hack.replace(/\s/g, '-')].replace(/\$([0-9]+)/g, '$$$$$1')}</script>`;
				}
				const [hackStr, options] = hack;
				return `<script>${
					hackDist[hackStr.replace(/\s/g, '-')]
						// remove comments (they can interfer with hackOptions regex)
						.replace(/\/\*\*[^]*?\*\//m)
						// replace hackOptions
						.replace(/(var hackOptions.*= ){[^]*?};$/m, `$1 ${
							JSON.stringify(options, (key, val) => ((typeof val === 'function') ? val.toString() : val), '\t')
								.replace(/"(function[^]*?})"/g, (_, s) => s.replace(/\\n/g, '\n').replace(/\\t/g, '\t'))
						};`)
						// make sure not to screw up the regex in the process
						.replace(/\$([0-9]+)/g, '$$$$$1')
				}</script>`;
			}).join('\n')
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

export async function startRecording() {
	recording = true;
}

export async function stopRecording() {
	recording = false;
}

export async function evaluate(fn) {
	await page.evaluate(fn);
}

// wait for bitsy to have handled input
export async function waitForFrame() {
	await evaluate(() => new Promise((r) => {
		window.jestUpdate = () => {
			window.jestUpdate = null;
			r();
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
	if (recording) {
		await snapshot();
	}
}

// take a screenshot of the current frame
// and perform a snapshot test on it
export async function snapshot() {
	try {
		const screenshot = await page.screenshot();
		expect(screenshot).toMatchImageSnapshot();
	} catch (err) {
		await end();
		throw err;
	}
}

// perform the sequence of key presses
// to walk from the default starting position
// to the space to the left of the cat
export async function walkToCat() {
	await press('Enter');
	await press('Enter');
	await press('ArrowDown');
	await press('ArrowDown');
	await press('ArrowDown');
	await press('ArrowDown');
	await press('ArrowDown');
	await press('ArrowDown');
	await press('ArrowDown');
	await press('ArrowDown');
	await press('ArrowRight');
	await press('ArrowRight');
	await press('ArrowRight');
}

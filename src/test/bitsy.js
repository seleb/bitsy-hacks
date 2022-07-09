import fs, { existsSync } from 'fs';
import { rm, writeFile } from 'fs/promises';
import { resolve } from 'path';
import puppeteer from 'puppeteer';
import util from 'util';
import pkg from '../../package.json';

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

let template;
let hackDist;

const testfilepath = resolve(__dirname, './.test.html');

async function loadResources() {
	if (template && hackDist) {
		return;
	}
	[template, hackDist] = await Promise.all([getHackTemplate(), getHackDist()]);
}

async function getHackDist() {
	const files = await readdir('./dist/');

	const fileContents = await Promise.all(
		files.map(file =>
			readFile(`./dist/${file}`, {
				encoding: 'utf8',
			})
		)
	);

	const fileMap = files.reduce(
		(result, file, idx) => ({
			...result,
			[file.match(/(.+)\.js$/)[1]]: fileContents[idx],
		}),
		{}
	);
	return fileMap;
}

async function getHackTemplate() {
	return readFile(resolve(__dirname, `Bitsy ${pkg.bitsyVersion}.html`), {
		encoding: 'utf8',
	});
}

/** @type puppeteer.Browser */
export let browser;
/** @type puppeteer.Page */
export let page;
let recording = false;

// simple delay helper
export function delay(ms) {
	return new Promise(r => {
		setTimeout(r, ms);
	});
}

// start puppeteer
// and configure it for testing a bitsy game
export async function start({ gamedata = '', title, catDialog = '', hacks = [] } = {}) {
	await loadResources();
	let game = template;

	// hack update to let jest know when updates happen
	game = game.replace(/(this\._update = function\(dt\) {)/, '$1window.jestUpdate && window.jestUpdate();');

	// replace gamedata
	if (gamedata) {
		game = game.replace(/(id="exportedGameData">)[^]*?(<\/script>)/, `$1${gamedata}$2`);
	}

	// replace title dialog
	if (title !== undefined) {
		game = game.replace(/Write your game's title here/g, title);
	}

	// replace cat dialog
	if (catDialog) {
		game = game.replace(/I'm a cat/, catDialog);
	}

	// add hacks
	if (hacks.length) {
		game = game.replace(
			/(<\/script>)(?![^]*?<\/script>)[^]*?(<\/head>)/,
			`$1${hacks
				.map(hack => {
					if (typeof hack === 'string') {
						// make sure not to screw up the regex in the process
						return `<script>${hackDist[hack.replace(/\s/g, '-')].replace(/\$([0-9]+)/g, '$$$$$1')}</script>`;
					}
					const [hackStr, options] = hack;
					return `<script>${hackDist[hackStr.replace(/\s/g, '-')]
						// remove comments (they can interfere with hackOptions regex)
						.replace(/\/\*\*[^]*?\*\//m)
						// replace hackOptions
						.replace(
							/(var hackOptions.*= ){[^]*?};$/m,
							`$1 ${JSON.stringify(options, (key, val) => (typeof val === 'function' ? val.toString() : val), '\t').replace(/"(function[^]*?})"/g, (_, s) =>
								s.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
							)};`
						)
						// make sure not to screw up the regex in the process
						.replace(/\$([0-9]+)/g, '$$$$$1')}</script>`;
				})
				.join('\n')}$2`
		);
	}

	// disable console logs since they slow things down
	game = game.replace(/(<\/script>)(?![^]*?<\/script>)[^]*?(<\/head>)/, '$1<script>console.log = () => {};</script>$2');

	// convert to url
	await writeFile(testfilepath, game, { encoding: 'utf-8' });

	// setup puppeteer
	page = await browser.newPage();
	await page.goto(`file://${testfilepath}`);
	await page.setViewport({
		width: 256,
		height: 256,
	});
}

export async function bitsyBeforeAll() {
	browser = await puppeteer.launch({
		headless: true,
		args: ['--mute-audio'],
	});
}

export async function bitsyAfterEach() {
	if (!page) return;
	await page.close();
	page = undefined;
}

export async function bitsyAfterAll() {
	if (existsSync(testfilepath)) {
		await rm(testfilepath);
	}
	await browser.close();
	browser = undefined;
}

export async function startRecording() {
	recording = true;
}

export async function stopRecording() {
	recording = false;
}

export function evaluate(fn, ...args) {
	return page.evaluate(fn, ...args);
}

// wait for bitsy to have handled input
export async function waitForFrame() {
	await evaluate(
		() =>
			new Promise(r => {
				window.jestUpdate = () => {
					window.jestUpdate = null;
					r();
				};
			})
	);
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
export async function snapshot(options) {
	const screenshot = await page.screenshot();
	expect(screenshot).toMatchImageSnapshot({ dumpDiffToConsole: true, ...options });
}

// perform the sequence of key presses
// to walk from the default starting position
// to the space to the left of the cat
export async function walkToCat() {
	await press('ArrowRight');
	await press('ArrowRight');
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

export async function waitForBlip() {
	await page.waitForFunction(() => !soundPlayer.isBlipPlaying());
}

export async function startDialog(dialog) {
	await evaluate(d => window.startDialog(d), dialog);
}

import fs from 'fs';
import {
	basename
} from "path";
import eslint from "rollup-plugin-eslint";

import headerComment from "./HeaderCommentPlugin";
import topLevelOptions from "./TopLevelOptionsPlugin";
import readme from "./ReadmePlugin";

import build from './index';

const fsp = fs.promises;

const inputDir = "./src/";
const outputDir = "./dist/";

async function buildHacks(hacks) {
	const outputFiles = hacks.map(name => `${outputDir}${basename(name).replace(/\s/g, '-')}`);

	// make dist
	!fs.existsSync(outputDir) && await fsp.mkdir(outputDir);

	// cleanup old dist
	await Promise.all(outputFiles.map(file => fs.existsSync(file) && fsp.unlink(file)));

	// build
	const output = await build(hacks, [
		eslint({}),
		readme.plugin(),
		headerComment(),
		topLevelOptions()
	]);

	// write to dist
	await Promise.all(output.map((file, idx) => fsp.writeFile(outputFiles[idx], file)));

	readme.parse();
	readme.write();
}

async function getArgs() {
	// use command-line args if present
	if (process.argv.length > 2) {
		return process.argv.slice(2);
	}

	// use source files otherwise
	const srcFiles = await fsp.readdir(inputDir);
	return srcFiles
		.filter(file => file.match(/^.*?(?<!\.test)\.js$/))
		.map(file => `${inputDir}${file}`);
}

getArgs()
	.then(buildHacks)
	.then(() => console.log('👍'))
	.catch(err => console.error('👎\n', err));

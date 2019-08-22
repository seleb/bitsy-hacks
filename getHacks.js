import path from "path";
import fs from 'fs';

export default function getHacks() {
	const inputDir = "./src/";
	const srcFiles = fs.readdirSync(inputDir);
	const hacks = srcFiles
		.filter(file => file.match(/^.*?(?<!\.test)\.js$/))
		.map(file => path.join(inputDir, file));
	return hacks;
}

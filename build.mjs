import { readdirSync } from "fs";
import rollup from "rollup";
import clear from "rollup-plugin-clear";
import eslint from "rollup-plugin-eslint";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

import headerComment from "./HeaderCommentPlugin";
import topLevelOptions from "./TopLevelOptionsPlugin";
import readme from "./ReadmePlugin";
import stripExportsPlugin from "./StripExportsPlugin";

const inputDir = "./src/";
const outputDir = "./dist/";

function build(src) {
	const inputOptions = {
		input: `${inputDir}${src}`,
		external: [
			'bitsy'
		],
		plugins: [
			clear({
				targets: [outputDir]
			}),
			nodeResolve(),
			commonjs(),
			stripExportsPlugin(),
			readme.plugin(),
			headerComment(),
			topLevelOptions(),
			eslint({})
		]
	};

	const outputOptions = {
		file: `${outputDir}${src.replace(/\s/g, '-')}`,
		format: "iife",
		globals: {
			bitsy: 'window'
		}
	};

	return rollup.rollup(inputOptions)
		.then(bundle => {
			return bundle.write(outputOptions);
		});
}

Promise.all(
	readdirSync(inputDir)
		.filter(file => file.match(/^.*?(?<!\.test)\.js$/))
		.map(build)
).then(() => {
	readme.parse();
	readme.write();
});

import rollup from "rollup";
import clear from "rollup-plugin-clear";
import eslint from "rollup-plugin-eslint";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

import headerComment from "./HeaderCommentPlugin";
import topLevelOptions from "./TopLevelOptionsPlugin";
import readme from "./ReadmePlugin";

const inputDir = "./src/";
const outputDir = "./dist/";

function build(src) {
	const inputOptions = {
		input: `${inputDir}${src}.js`,
		external: [
			'bitsy'
		],
		plugins: [
			clear({
				targets: [outputDir]
			}),
			nodeResolve(),
			commonjs(),
			readme.plugin(),
			headerComment(),
			topLevelOptions(),
			eslint({})
		]
	};

	const outputOptions = {
		file: `${outputDir}${src}.js`,
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

Promise.all([
	"basic sfx",
	"bitsymuse",
	"canvas replacement",
	"corrupt",
	"custom text effect",
	"directional avatar",
	"dynamic background",
	"edit image from dialog",
	"end-from-dialog",
	"exit-from-dialog",
	"external-game-data",
	"favicon-from-sprite",
	"follower",
	"gamepad input",
	"javascript dialog",
	"logic-operators-extended",
	"multi-sprite avatar",
	"noclip",
	"permanent items",
	"solid items",
	"stopwatch",
	"tracery processing",
	"transparent dialog",
	"transparent sprites",
	"unique items"
].map(src => {
	return build(src);
})).then(() => {
	readme.parse();
	// HACK: custom font isn't in build system right now, so add it directly
	readme.headers.push({
		emoji: "🅰",
		file: "custom font",
		url: "https://seleb.github.io/bitsy-hacks/custom%20font/custom%20font%20-%20converter.html",
		summary: "change the bitsy font"
	});
	readme.write();
});

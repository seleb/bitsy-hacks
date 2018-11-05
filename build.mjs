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
			stripExportsPlugin(),
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
	"avatar by room",
	"basic sfx",
	"bitsymuse",
	"canvas replacement",
	"corrupt",
	"custom text effect",
	"directional avatar",
	"dynamic background",
	"edit dialog from dialog",
	"edit image from dialog",
	"end-from-dialog",
	"exit-from-dialog",
	"expose variables",
	"external-game-data",
	"favicon-from-sprite",
	"follower",
	"gamepad input",
	"itsy-bitsy",
	"javascript dialog",
	"logic-operators-extended",
	"multi-sprite avatar",
	"noclip",
	"online",
	"opaque tiles",
	"paragraph-break",
	"permanent items",
	"solid items",
	"stopwatch",
	"tracery processing",
	"transitions",
	"transparent dialog",
	"transparent sprites",
	"unique items"
].map(src => {
	return build(src);
})).then(() => {
	readme.parse();
	readme.write();
});

const rollup = require("rollup");
const clear = require("rollup-plugin-clear");
const eslint = require("rollup-plugin-eslint");
const nodeResolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");

const headerComment = require("./HeaderCommentPlugin");
const topLevelOptions = require("./TopLevelOptionsPlugin");

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

	rollup.rollup(inputOptions)
	.then(bundle => {
		bundle.write(outputOptions);
	});
}

[
	"basic sfx",
	"canvas replacement",
	"corrupt",
	"custom text effect",
	"directional avatar",
	"dynamic background",
	"end-from-dialog",
	"exit-from-dialog",
	"external-game-data",
	"favicon-from-sprite",
	"follower",
	"gamepad input",
	"noclip",
	"tracery processing",
	"transparent sprites",
	"unique items"
].forEach(build);
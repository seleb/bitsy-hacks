const rollup = require("rollup");
const clear = require("rollup-plugin-clear");
const eslint = require("rollup-plugin-eslint");
const nodeResolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");

const headerComment = require("./HeaderCommentPlugin");
const topLevelOptions = require("./TopLevelOptionsPlugin");
const readme = require("./ReadmePlugin");

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
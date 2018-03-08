const rollup = require("rollup");
const clear = require("rollup-plugin-clear");

const headerComment = require("./HeaderCommentPlugin");

const inputDir = "./src/";
const outputDir = "./dist/";

function build(src) {
	const inputOptions = {
		input: `${inputDir}${src}.js`,
		plugins: [
			clear({
				targets: [outputDir]
			}),
			headerComment()
		]
	};

	const outputOptions = {
		file: `${outputDir}${src}.js`,
		format: "iife"
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
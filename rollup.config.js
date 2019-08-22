import path from "path";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

import base from "./rollup.config.base.json";

import headerComment from "./HeaderCommentPlugin";
import topLevelOptions from "./TopLevelOptionsPlugin";
import readme from "./ReadmePlugin";
import getHacks from "./getHacks";

const sharedOptions = {
	...base,
	plugins: [
		nodeResolve(),
		commonjs(),
		readme(),
		headerComment(),
		topLevelOptions(),
	],
};

export default getHacks().map(input => ({
	...sharedOptions,
	input,
	output: {
		...sharedOptions.output,
		file: `./dist/${path.basename(input).replace(/\s/g,'-')}`,
		name: `hacks.${path.basename(input, '.js').replace(/\s/g,'_')}`,
	},
}));

import {
	basename
} from "path";

import rollup from "rollup";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export async function buildOne(src = '', plugins = []) {
	const inputOptions = {
		input: src,
		external: [
			'bitsy'
		],
		plugins: [
			nodeResolve(),
			commonjs()
		].concat(plugins)
	};

	const outputOptions = {
		format: "iife",
		globals: {
			bitsy: 'window'
		},
		name: `hacks.${basename(src, '.js').replace(/\s/g,'_')}`,
		indent: false,
		extend: true,
	};

	const bundle = await rollup.rollup(inputOptions);
	const {
		output: [{
			code,
		}],
	} = await bundle.generate(outputOptions);
	return code;
}

export async function build(hacks = [], plugins) {
	const output = await Promise.all(hacks.map(hack => buildOne(hack, plugins)));
	return output;
}

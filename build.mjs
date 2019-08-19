import {
	basename
} from "path";

import rollup from "rollup";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export async function buildOne(src = '', plugins = [], externalDeps = {}) {
	const inputOptions = {
		input: src,
		external: [
			'bitsy'
		].concat(Object.keys(externalDeps)),
		plugins: [
			nodeResolve(),
			commonjs()
		].concat(plugins)
	};

	const outputOptions = {
		format: "iife",
		globals: Object.assign({
			bitsy: 'window'
		}, externalDeps),
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

export async function build(hacks = [], plugins, externalDeps) {
	const output = await Promise.all(hacks.map(hack => buildOne(hack, plugins, externalDeps)));
	return output;
}

const pkg = require('./package.json');
// moves the last /**/ block to the top of the output
// assuming the source doesn't have any other /**/ blocks,
// this will be the header
// this is hackier than it should be, but gets the job done for now

// eslint-disable-next-line import/no-default-export
export default function () {
	return {
		renderChunk(code) {
			const pattern = /^(\/\*[\S\s]*?\*\/)$/gm;
			const matches = code.match(pattern);
			if (!matches) {
				return {
					code: code,
				};
			}
			const header = matches[matches.length - 1];
			return {
				code: `${header}\n${code.replace(header, '')}`.replace(/(^@author .*$)/gm, `$1\n@version ${pkg.version}\n@requires Bitsy ${pkg.bitsyVersion}\n`),
			};
		},
	};
}

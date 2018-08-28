'use strict';
// moves the last `var hackOptions={...}` block to the top of the output
// this is hackier than it should be, but gets the job done for now
export default function () {
	return {
		transformBundle(code) {
			const pattern = /^var\s+hackOptions.*?\s?=\s?{[\s\S]*?^};$/gm;
			const matches = code.match(pattern);
			if (!matches) {
				return {
					code: code
				};
			}
			const header = matches[matches.length - 1];
			return {
				code: code.replace(header, '').replace("'use strict';", `'use strict';\n${header}`)
			};
		}
	};
}

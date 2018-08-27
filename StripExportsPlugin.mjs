'use strict';
// removes `export` from vars in entry file
export default function () {
	var hack;
	return {
		options(options) {
			hack = options.entry.match(/src[/\\](.+?)\.js$/)[1];
		},
		transform(source, id) {
			if (!hack) {
				return source;
			}
			const cur = (id.match(/src[/\\](.+?)\.js$/) || [])[1];
			if (cur !== hack) {
				return source;
			}

			return source.replace(/export var/g, 'var');
		}
	};
}

// a Very Bad readme generator
"use strict";

import doctrine from "doctrine";
import fs from "fs";
import pkg from "./package.json";
import getHacks from './getHacks';

const l = getHacks().length;
const headers = [];

function write() {
	var contents = headers
		.filter(h => h)
		.map(header => doctrine.parse(header, {
			unwrap: true,
			recoverable: true
		}))
		.map(jsdoc => {
			var o = {};
			o.emoji = jsdoc.description;
			for (var i in jsdoc.tags) {
				o[jsdoc.tags[i].title] = jsdoc.tags[i].description;
			}
			o.file = o.file || '';
			o.url = `/dist/${encodeURI(o.file.replace(/\s/g, '-'))}.js`;
			return o;
		})
		.sort((a, b) => {
			return a.file < b.file ? -1 : a.file > b.file ? 1 : 0;
		});
	fs.writeFileSync("README.md", `# bitsy hacks

\`\`\`sh
npm i ${pkg.name}
\`\`\`

A collection of re-usable scripts for [Adam Le Doux](https://twitter.com/adamledoux)'s [Bitsy Game Maker](https://ledoux.itch.io/bitsy).

- [Contents](#contents)
- [How to use](#how-to-use)
- [Further reading](#further-reading)

## Contents

${contents.map(hack => 
`- ${hack.emoji} [${hack.file}](${hack.url}): ${hack.summary}`
).join('\n')}

![Imgur](https://i.imgur.com/peRLLHn.gif)![Imgur](https://i.imgur.com/yg81aH2.gif)![Imgur](https://i.imgur.com/r7AUHX4.gif)




## How to use

Each script has a short "HOW TO USE" section included in the comments. For steps which say to \`Copy-paste this script into a script tag after the bitsy source \`, open your exported bitsy game and scroll to the bottom of the file (at the time of writing, it looks like this):

\`\`\`html
</script>

</head>


<!-- DOCUMENT BODY -->
<body onload='startExportedGame()'>
  <!-- GAME CANVAS -->
  <canvas id='game'></canvas>
</body>


</html>
\`\`\`

then edit it to look like this:

\`\`\`html
</script>

<script>
  // and then paste your code here!
</script>

</head>


<!-- DOCUMENT BODY -->
<body onload='startExportedGame()'>
  <!-- GAME CANVAS -->
  <canvas id='game'></canvas>
</body>


</html>
\`\`\`

## Further reading

- [Writing hacks with this repo's source code](https://github.com/seleb/bitsy-hacks/wiki)
- [Claire Morley's "A Bitsy Tutorial"](http://www.shimmerwitch.space/bitsyTutorial)
- [Bitsy games!](https://itch.io/games/tag-bitsy)
- [AYolland's Borksy](https://ayolland.itch.io/borksy): Hack helper
- [ruin's image-to-bitsy](https://ruin.itch.io/image-to-bitsy): Artistic aid
- [Fontsy](https://seansleblanc.itch.io/Fontsy): Typographic tool

If you have any issues, feel free to ping me, [open an issue](https://github.com/seleb/bitsy-hacks/issues/new), or ask for help on the [bitsy discord](https://discordapp.com/invite/9rAjhtr)!`);
}

export default function (options = {}) {
	return {
		// grab headers
		renderChunk(code) {
			const pattern = /^(\/\*\*[\S\s]*?\*\/)$/gm;
			const matches = code.match(pattern);
			if (!matches) {
				console.warn("Couldn't find jsdoc");
				headers.push(null);
				return code;
			}
			const header = matches[matches.length - 1];
			headers.push(header);
			return code;
		},
		writeBundle() {
			if (headers.length === l) {
				write();
			}
		},
	};
}

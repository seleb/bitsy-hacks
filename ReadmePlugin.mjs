// a Very Bad readme generator
"use strict";

import doctrine from "doctrine";
import fs from "fs";
import pkg from "./package.json";

export default {
	headers: [],
	plugin: function (options = {}) {
		const self = this;
		return {
			// grab headers
			renderChunk(code) {
				const pattern = /^(\/\*\*[\S\s]*?\*\/)$/gm;
				const matches = code.match(pattern);
				if (!matches) {
					console.warn("Couldn't find jsdoc");
					return code;
				}
				const header = matches[matches.length - 1];
				self.headers.push(header);
				return code;
			}
		};
	},
	parse: function () {
		this.headers = this.headers.map(header => {
			return doctrine.parse(header, {
				unwrap: true,
				recoverable: true
			});
		}).map(jsdoc => {
			var o = {};
			o.emoji = jsdoc.description;
			for (var i in jsdoc.tags) {
				o[jsdoc.tags[i].title] = jsdoc.tags[i].description;
			}
			o.url = `/dist/${encodeURI(o.file.replace(/\s/g, '-'))}.js`;
			return o;
		});
	},
	write: function () {
		var contents = this.headers.sort((a, b) => {
			return a.file < b.file ? -1 : a.file > b.file ? 1 : 0;
		});
		fs.writeFileSync("README.md", `# ${pkg.name}

A collection of re-usable scripts for [Adam Le Doux](https://twitter.com/adamledoux)'s [Bitsy Game Maker](https://ledoux.itch.io/bitsy).

## contents

${contents.map(hack => 
	`- ${hack.emoji} [${hack.file}](${hack.url}): ${hack.summary}`
).join('\n')}

![Imgur](https://i.imgur.com/peRLLHn.gif)![Imgur](https://i.imgur.com/yg81aH2.gif)![Imgur](https://i.imgur.com/r7AUHX4.gif)




## how to use

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

- [Andrew Yolland's Borksy](https://ayolland.itch.io/borksy): Hack helper
- [ruin's image-to-bitsy](https://ruin.itch.io/image-to-bitsy): Artistic aid
- [Fontsy](https://seansleblanc.itch.io/Fontsy): Typographic tool

If you have any issues, feel free to ping me or ask for help on the [bitsy discord](https://discordapp.com/invite/9rAjhtr)!`);
	}
};

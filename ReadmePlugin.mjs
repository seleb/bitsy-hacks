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
- [FAQ](#FAQ)
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

## FAQ

- > I don't know javascript. Can I still use the hacks?

  Yes, most of the hacks require little to no javascript experience.

- > Can I import a hacked file back into the Bitsy editor?

  Yes, but unfortunately only the gamedata will be imported, and the hacks will be lost. To edit a hacked game, it's recommended that you keep a copy of the hacked html file, and copy-paste edited gamedata into it. If you need to do this a lot, there are a few tools available to speed up your workflow (e.g. [bitsy-savior](https://aloelazoe.itch.io/bitsy-savior), [Borksy](https://ayolland.itch.io/borksy), [bitsy-boilerplate](https://github.com/seleb/bitsy-boilerplate)).

- > Some of these hack files are kinda long. Do I need to copy the whole thing?

  Yes, you need the entire hack file in order for it to work. If for some reason you're *really* concerned with filesize (you shouldn't be), you can programmatically compose and minify them (either by cloning this repo or by using the [bitsy-boilerplate](https://github.com/seleb/bitsy-boilerplate) project), but this is only recommended for developers familiar with javascript bundling.

- > Can I combine multiple hacks?

  Yes, but there are [known issues with specific combinations](https://github.com/seleb/bitsy-hacks/issues?q=is%3Aissue+label%3Amulti-hack+). If you're having issues using multiple hacks, try testing them one at a time to make sure they've each been setup correctly.

- > Do the hacks work with forks like [Bitsy 3D](https://aloelazoe.itch.io/bitsy-3d), [Bitsy HD](https://vonbednar.itch.io/bitsy-x2), or [Bitsy Color](https://aurysystem.itch.io/multicolorbisty)?

  It varies by hack and by fork. If something doesn't work, try testing against a regular Bitsy game to make sure you've setup the hack correctly.
  
  Bitsy HD in particular is a fairly old fork, and generally needs [older versions of hacks](https://github.com/seleb/bitsy-hacks/tree/d419cf6b84822a6419a78ad82336333771b27bf0/dist).

If your question isn't covered here, it may be in the general [Bitsy FAQ](https://docs.google.com/document/d/1jRz3wgkQU3kZN_LGChw4UlMWhVoc145J-euBtkr7NeE).

For other issues, feel free to ping me, [open an issue](https://github.com/seleb/bitsy-hacks/issues/new), or ask for help on the [Bitsy discord](https://discordapp.com/invite/9rAjhtr)!

## Further reading

- [Writing hacks with this repo's source code](https://github.com/seleb/bitsy-hacks/wiki)
- [Claire Morley's "A Bitsy Tutorial"](http://www.shimmerwitch.space/bitsyTutorial)
- [Bitsy games!](https://itch.io/games/tag-bitsy)
- [AYolland's Borksy](https://ayolland.itch.io/borksy): Hack helper
- [elkie's bitsy-savior](https://aloelazoe.itch.io/bitsy-savior): Safe saver
- [ruin's image-to-bitsy](https://ruin.itch.io/image-to-bitsy): Artistic aid
- [Fontsy](https://seansleblanc.itch.io/Fontsy): Typographic tool`);
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

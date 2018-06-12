
# bitsy-hacks
A collection of re-usable scripts for [Adam LeDoux](https://twitter.com/adamledoux)'s [Bitsy Game Maker](https://ledoux.itch.io/bitsy).

## contents
 - 🔈 [basic sfx](/dist/basic%20sfx.js): "walk" and "talk" sound effect support
 - 😌 [bitsymuse](/dist/bitsymuse.js): A variety of Bitsy sound and music handlers
 - 😴 [canvas replacement](/dist/canvas%20replacement.js): WebGLazy bitsy integration (this one's mostly just for me)
 - ➿ [corrupt](/dist/corrupt.js): corrupts gamedata at runtime
 - 🅰 [custom font](https://seleb.github.io/bitsy-hacks/custom%20font/custom%20font%20-%20converter.html): change the bitsy font
 - 🅰 [custom text effect](/dist/custom%20text%20effect.js): make {custom}text effects{custom}
 - ↔ [directional avatar](/dist/directional%20avatar.js): flips the player's sprite based on directional movement
 - 🖼 [dynamic background](/dist/dynamic%20background.js): HTML background matching bitsy background
 - 🖌 [edit image from dialog](/dist/edit%20image%20from%20dialog.js): edit sprites, items, and tiles from dialog
 - 🔚 [end-from-dialog](/dist/end-from-dialog.js): trigger an ending from dialog, including narration text
 - 🚪 [exit-from-dialog](/dist/exit-from-dialog.js): exit to another room from dialog, including conditionals
 - 🛰 [external-game-data](/dist/external-game-data.js): separate Bitsy game data from your (modded) HTML for easier development
 - 🌐 [favicon-from-sprite](/dist/favicon-from-sprite.js): generate a browser favicon (tab icon) from a Bitsy sprite, including animation!
 - 💕 [follower](/dist/follower.js): makes a single sprite follow the player
 - 🎮 [gamepad input](/dist/gamepad%20input.js): HTML5 gamepad support
 - ☕ [javascript dialog](/dist/javascript%20dialog.js): execute arbitrary javascript from dialog
 - 🔀 [logic-operators-extended](/dist/logic-operators-extended.js): adds conditional logic operators
 - 👨‍👨‍👧‍👧 [multi-sprite avatar](/dist/multi-sprite%20avatar.js): make the player big
 - 📎 [noclip](/dist/noclip.js): walk through wall tiles, sprites, items, exits, and endings
 - ⏳ [permanent items](/dist/permanent%20items.js): prevent some items from being picked up
 - 🛑 [solid items](/dist/solid%20items.js): treat some items like sprites that can be placed multiple times
 - 🏰 [tracery processing](/dist/tracery%20processing.js): process all dialog text with a tracery grammar
 - 🏁 [transparent sprites](/dist/transparent%20sprites.js): makes all sprites have transparent backgrounds
 - ❄ [unique items](/dist/unique%20items.js): items which, when picked up, remove all other instances of that item from the game

![Imgur](https://i.imgur.com/peRLLHn.gif)![Imgur](https://i.imgur.com/yg81aH2.gif)![Imgur](https://i.imgur.com/r7AUHX4.gif)




## how to use
Each script has a short "HOW TO USE" section included in the comments. For steps which say to `Copy-paste this script into a script tag after the bitsy source `, open your exported bitsy game and scroll to the bottom of the file (at the time of writing, it looks like this):
```html
</script>

</head>


<!-- DOCUMENT BODY -->
<body onload='startExportedGame()'>
  <!-- GAME CANVAS -->
  <canvas id='game'></canvas>
</body>


</html>
```

then edit it to look like this:

```html
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
```

## Further reading
- [Writing hacks with this repo's source code](https://github.com/seleb/bitsy-hacks/wiki)
- [Claire Morley's "A Bitsy Tutorial"](http://www.clairemorleyart.com/a-bitsy-tutorial)
- [Bitsy games!](https://itch.io/games/tag-bitsy)

- [Andrew Yolland's Borksy](https://ayolland.itch.io/borksy): Hack helper
- [ruin's image-to-bitsy](https://ruin.itch.io/image-to-bitsy): Artistic aid
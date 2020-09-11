# @bitsy/hecks

A collection of re-usable scripts for [Adam Le Doux](https://twitter.com/adamledoux)'s [Bitsy Game Maker](https://ledoux.itch.io/bitsy).

- [Contents](#contents)
- [How to use](#how-to-use)
- [Further reading](#further-reading)

## Contents

- 📦 [3d](/dist/3d.js): bitsy in three dee
- 👥 [avatar by room](/dist/avatar-by-room.js): change the avatar in certain rooms
- 🔈 [basic sfx](/dist/basic-sfx.js): "walk" and "talk" sound effect support
- 😌 [bitsymuse](/dist/bitsymuse.js): A variety of Bitsy sound and music handlers
- 😴 [canvas replacement](/dist/canvas-replacement.js): WebGLazy bitsy integration (this one's mostly just for me)
- 😽 [character portraits](/dist/character-portraits.js): high quality anime jpegs (or pngs i guess)
- 🙀 [character portraits animated](/dist/character-portraits-animated.js): high quality anime gifs
- ⛔️ [close on ending](/dist/close-on-ending.js): Prevents from playing past an ending
- ➿ [corrupt](/dist/corrupt.js): corrupts gamedata at runtime
- 🅰 [custom text effect](/dist/custom-text-effect.js): make {custom}text effects{custom}
- 🎞 [custom-exit-effects](/dist/custom-exit-effects.js): make custom exit transition effects
- ⌨ [custom-keyhandlers](/dist/custom-keyhandlers.js): run custom code on key inputs
- 💬 [dialog audio](/dist/dialog-audio.js): animal crossing-style audio
- 🎺 [dialog audio vocal synth](/dist/dialog-audio-vocal-synth.js): animal crossing-style audio powered by the pink trombone vocal synth
- 🔁 [dialog box transition](/dist/dialog-box-transition.js): adds an easing transition animation to display the dialog box text
- 🔀 [dialog choices](/dist/dialog-choices.js): binary dialog choices
- 🚀 [dialog jump](/dist/dialog-jump.js): jump from one dialog entry to another
- 💬 [dialog pause](/dist/dialog-pause.js): add pauses in between printing text
- ⌨ [dialog prompt](/dist/dialog-prompt.js): prompt the user for text input in dialog
- 🔝 [direction in dialog](/dist/direction-in-dialog.js): provides a variable with player direction
- ↔ [directional avatar](/dist/directional-avatar.js): flips the player's sprite based on directional movement
- 🖼 [dynamic background](/dist/dynamic-background.js): HTML background matching bitsy background
- 📝 [edit dialog from dialog](/dist/edit-dialog-from-dialog.js): edit dialog from dialog (yes really)
- 🖌 [edit image from dialog](/dist/edit-image-from-dialog.js): edit sprites, items, and tiles from dialog
- 👯‍♂️ [edit player from dialog](/dist/edit-player-from-dialog.js): change which sprite is controlled by the player
- 🏠 [edit room from dialog](/dist/edit-room-from-dialog.js): modify the content of a room from dialog
- 🔚 [end-from-dialog](/dist/end-from-dialog.js): trigger an ending from dialog, including narration text
- 🚪 [exit-from-dialog](/dist/exit-from-dialog.js): exit to another room from dialog, including conditionals
- 🛰 [external-game-data](/dist/external-game-data.js): separate Bitsy game data from your (modded) HTML for easier development
- 🌐 [favicon-from-sprite](/dist/favicon-from-sprite.js): generate a browser favicon (tab icon) from a Bitsy sprite, including animation!
- 💕 [follower](/dist/follower.js): make sprites follow the player
- 🎮 [gamepad input](/dist/gamepad-input.js): HTML5 gamepad support
- 🍂 [gravity](/dist/gravity.js): Pseudo-platforming/gravity/physics
- 🕷 [itsy-bitsy](/dist/itsy-bitsy.js): for when bitsy's not small enough
- ☕ [javascript dialog](/dist/javascript-dialog.js): execute arbitrary javascript from dialog
- 🔀 [logic-operators-extended](/dist/logic-operators-extended.js): adds conditional logic operators
- 📜 [long dialog](/dist/long-dialog.js): put more words onscreen
- 👨‍👨‍👧‍👧 [multi-sprite avatar](/dist/multi-sprite-avatar.js): make the player big
- 📎 [noclip](/dist/noclip.js): walk through wall tiles, sprites, items, exits, and endings
- 🔄 [online](/dist/online.js): multiplayer bitsy
- ⬛ [opaque tiles](/dist/opaque-tiles.js): tiles which hide the player
- 🎨 [palette maps](/dist/palette-maps.js): allows color pallettes to be defined on a tile-by-tile basis
- 📃 [paragraph-break](/dist/paragraph-break.js): Adds paragraph breaks to the dialogue parser
- ⏳ [permanent items](/dist/permanent-items.js): prevent some items from being picked up
- ➡ [push sprites](/dist/push-sprites.js): sokoban-style sprite pushing
- 🎭 [replace drawing](/dist/replace-drawing.js): add name-tags to replace drawings when the game is loading
- 💾 [save](/dist/save.js): save/load your game
- 🏃 [smooth moves](/dist/smooth-moves.js): ease the player's movement
- 🛑 [solid items](/dist/solid-items.js): treat some items like sprites that can be placed multiple times
- 💃 [sprite effects](/dist/sprite-effects.js): like text effects, but for sprites
- ⏱️ [stopwatch](/dist/stopwatch.js): time player actions
- 🗣 [text-to-speech](/dist/text-to-speech.js): text-to-speech for bitsy dialog
- 📐 [textbox styler](/dist/textbox-styler.js): customize the style and properties of the textbox
- 🏰 [tracery processing](/dist/tracery-processing.js): process all dialog text with a tracery grammar
- 🎞 [transitions](/dist/transitions.js): customizable WebGL transitions
- 👁️‍🗨️ [transparent dialog](/dist/transparent-dialog.js): makes the dialog box have a transparent background
- 🏁 [transparent sprites](/dist/transparent-sprites.js): makes all sprites have transparent backgrounds
- 💱 [twine bitsy comms](/dist/twine-bitsy-comms.js): interprocess communication for twine and bitsy
- ❄ [unique items](/dist/unique-items.js): items which, when picked up, remove all other instances of that item from the game

![Imgur](https://i.imgur.com/peRLLHn.gif)![Imgur](https://i.imgur.com/yg81aH2.gif)![Imgur](https://i.imgur.com/r7AUHX4.gif)




## How to use

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
- [Claire Morley's "A Bitsy Tutorial"](http://www.shimmerwitch.space/bitsyTutorial)
- [Bitsy games!](https://itch.io/games/tag-bitsy)
- [Andrew Yolland's Borksy](https://ayolland.itch.io/borksy): Hack helper
- [ruin's image-to-bitsy](https://ruin.itch.io/image-to-bitsy): Artistic aid
- [Fontsy](https://seansleblanc.itch.io/Fontsy): Typographic tool

If you have any issues, feel free to ping me, [open an issue](https://github.com/seleb/bitsy-hacks/issues/new), or ask for help on the [bitsy discord](https://discordapp.com/invite/9rAjhtr)!
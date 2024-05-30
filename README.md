# bitsy hacks

```sh
npm i @bitsy/hecks
```

A collection of re-usable scripts for [Adam Le Doux](https://twitter.com/adamledoux)'s [Bitsy Game Maker](https://ledoux.itch.io/bitsy). See [Ayolland's Borksy](https://ayolland.itch.io/borksy) for a GUI that allows you to use these hacks with less copy-pasting.

Last tested against Bitsy 8.12

- [Contents](#contents)
- [How to use](#how-to-use)
- [FAQ](#FAQ)
- [Old Versions](#old-versions)
- [Further reading](#further-reading)

## Contents

- 👥 [avatar by room](/dist/avatar-by-room.js): change the avatar in certain rooms
- 🖼 [backdrops](/dist/backdrops.js): makes the game have a backdrop
- 🔈 [basic sfx](/dist/basic-sfx.js): "walk" and "talk" sound effect support
- 😌 [bitsymuse](/dist/bitsymuse.js): A variety of Bitsy sound and music handlers
- 😴 [canvas replacement](/dist/canvas-replacement.js): WebGLazy bitsy integration (this one's mostly just for me)
- 😽 [character portraits](/dist/character-portraits.js): high quality anime jpegs (or pngs i guess)
- 🙀 [character portraits animated](/dist/character-portraits-animated.js): high quality anime gifs
- ⛔️ [close on ending](/dist/close-on-ending.js): Prevents from playing past an ending
- ➿ [corrupt](/dist/corrupt.js): corrupts gamedata at runtime
- 🎞 [custom-exit-effects](/dist/custom-exit-effects.js): make custom exit transition effects
- 🅰 [custom text effect](/dist/custom-text-effect.js): make {custom}text effects{custom}
- 💬 [dialog audio](/dist/dialog-audio.js): animal crossing-style audio
- 🎺 [dialog audio vocal synth](/dist/dialog-audio-vocal-synth.js): animal crossing-style audio powered by the pink trombone vocal synth
- 🔁 [dialog box transition](/dist/dialog-box-transition.js): adds an easing transition animation to display the dialog box text
- 🔀 [dialog choices](/dist/dialog-choices.js): dialog choices
- 🚀 [dialog jump](/dist/dialog-jump.js): jump from one dialog entry to another
- 💬 [dialog pause](/dist/dialog-pause.js): add pauses in between printing text
- ⌨ [dialog prompt](/dist/dialog-prompt.js): prompt the user for text input in dialog
- ↔ [directional avatar](/dist/directional-avatar.js): flips the player's sprite based on directional movement
- 🔝 [direction in dialog](/dist/direction-in-dialog.js): provides a variable with player direction
- 🖼 [dynamic background](/dist/dynamic-background.js): HTML background matching bitsy background
- 📝 [edit dialog from dialog](/dist/edit-dialog-from-dialog.js): edit dialog from dialog (yes really)
- 🖌 [edit image from dialog](/dist/edit-image-from-dialog.js): edit sprites, items, and tiles from dialog
- 👯‍♂️ [edit player from dialog](/dist/edit-player-from-dialog.js): change which sprite is controlled by the player
- 🏠 [edit room from dialog](/dist/edit-room-from-dialog.js): modify the content of a room from dialog
- 🔚 [end-from-dialog](/dist/end-from-dialog.js): trigger an ending from dialog, including narration text (deprecated)
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
- 🔄 [online](/dist/online.js): multiplayer bitsy
- ⬛ [opaque tiles](/dist/opaque-tiles.js): tiles which hide the player
- 📃 [paragraph-break](/dist/paragraph-break.js): Adds paragraph breaks to the dialogue parser
- ⏳ [permanent items](/dist/permanent-items.js): prevent some items from being picked up
- ➡ [push sprites](/dist/push-sprites.js): sokoban-style sprite pushing
- 🎭 [replace drawing](/dist/replace-drawing.js): add name-tags to replace drawings when the game is loading
- 💾 [save](/dist/save.js): save/load your game
- 🛑 [solid items](/dist/solid-items.js): treat some items like sprites that can be placed multiple times
- ⏱️ [stopwatch](/dist/stopwatch.js): time player actions
- 🗣 [text-to-speech](/dist/text-to-speech.js): text-to-speech for bitsy dialog
- 🏰 [tracery processing](/dist/tracery-processing.js): process all dialog text with a tracery grammar
- 🎞 [transitions](/dist/transitions.js): customizable WebGL transitions
- 🔳 [transparent background](/dist/transparent-background.js): makes the game have a transparent background
- 👁️‍🗨️ [transparent dialog](/dist/transparent-dialog.js): makes the dialog box have a transparent background
- 🏁 [transparent sprites](/dist/transparent-sprites.js): makes all sprites have transparent backgrounds (deprecated)
- 💱 [twine bitsy comms](/dist/twine-bitsy-comms.js): interprocess communication for twine and bitsy
- ❄ [unique items](/dist/unique-items.js): items which, when picked up, remove all other instances of that item from the game

![Custom text effect demo](https://i.imgur.com/peRLLHn.gif)![Follower demo](https://i.imgur.com/yg81aH2.gif)![Unique items demo](https://i.imgur.com/r7AUHX4.gif)

## How to use

Each script has a short "HOW TO USE" section included in the comments. For steps which say to `Copy-paste this script into a script tag after the bitsy source`, open your exported bitsy game and scroll to the bottom of the file (at the time of writing, it looks like this):

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

- > Do the hacks work with emulators like [bitsy boutique](https://candle.itch.io/bitsy-boutique) or [bitsybox](https://ledoux.itch.io/bitsybox)?

  No. Emulators function by re-implementing parts of the engine and/or browser into another environment, but the hacks rely heavily on how the engine is structured and how the browser handles `<script>` tags. However, desktop projects which preserve the original engine/browser context (e.g. [Electron](https://www.electronjs.org/), [NW.js](https://nwjs.io/)) can be used.

If your question isn't covered here, it may be in the general [Bitsy documentation](https://make.bitsy.org/docs).

For other issues, feel free to [open an issue](https://github.com/seleb/bitsy-hacks/issues/new), [contact me directly](https://seans.site#contact), or ask for help on the [Bitsy forum](https://ledoux.itch.io/bitsy/community)!

## Old Versions

Bitsy and the hacks are generally not backwards-compatible: when Bitsy updates, it often breaks individual hacks. If you're having issues with hacks after a Bitsy update, it's possible they are out of date. Feel free to reach out for help or open an issue if you suspect this is the case.

If you are using an older version of Bitsy (or a fork based on an older version), you may require old versions of the hacks. Support is not guaranteed across versions, and old versions are not maintained, but some helpful points in history are listed below.

- [Bitsy 7.12](https://github.com/seleb/bitsy-hacks/tree/v20.2.5/dist)
- [Bitsy 7.11](https://github.com/seleb/bitsy-hacks/tree/v19.2.7/dist)
- [Bitsy 7.8-7.9](https://github.com/seleb/bitsy-hacks/tree/v17.0.0/dist)
- [Bitsy 7.2-7.7](https://github.com/seleb/bitsy-hacks/tree/v16.0.3/dist)
- [Bitsy 5.1](https://github.com/seleb/bitsy-hacks/tree/d419cf6b84822a6419a78ad82336333771b27bf0/dist)

## Further reading

- [Writing hacks with this repo's source code](https://github.com/seleb/bitsy-hacks/wiki)
- [Claire Morley's "A Bitsy Tutorial"](http://www.shimmerwitch.space/bitsyTutorial)
- [Bitsy games!](https://itch.io/games/tag-bitsy)
- [elkie's bitsy-savior](https://aloelazoe.itch.io/bitsy-savior): Safe saver
- [ruin's image-to-bitsy](https://ruin.itch.io/image-to-bitsy): Artistic aid
- [Fontsy](https://seansleblanc.itch.io/Fontsy): Typographic tool
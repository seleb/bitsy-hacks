/*
  ==============================
  SPRITE FAVICON MOD (@mildmojo)
  ==============================

  Use one of your game sprites as the page favicon. It'll even animate if the
  sprite has multiple frames!

  HOW TO USE:
    1. Copy-paste this script into a new script tag after the Bitsy source code.
    2. Edit the top of the script to configure which sprite and colors it should
       use for the favicon. By default, it will draw the player avatar sprite in
       the first available palette's colors.

  Version: 1.0
  Bitsy Version: 4.5, 4.6
  License: WTFPL (do WTF you want)
*/

// Give a hoot, don't pollute; encapsulate in an IIFE for isolation.
(function(globals) {
  'use strict';

  // Configuration for favicon
  // Sprite name as configured in editor. Defaults to player avatar.
  var SPRITE_NAME = '';
  // Palette name or number to draw colors from.
  var PALETTE_ID = 0;
  // Favicon background color in palette. 0 = BG, 1 = Tile, 2 = Sprite.
  var BG_COLOR_NUM = 0;
  // Favicon sprite color in palette. 0 = BG, 1 = Tile, 2 = Sprite.
  var FG_COLOR_NUM = 2;
  // Padding in pixels around sprite.
  var PIXEL_PADDING = 2;
  // Should the favicon have rounded corners? (Suggest margin 2px if rounding.)
  var ROUNDED_CORNERS = true;
  // Frame change interval if sprite is animated. Use `Infinity` to disable.
  var FRAME_DELAY = 400;

  var canvas = document.createElement('canvas');
  canvas.width = 16+2*PIXEL_PADDING;
  canvas.height = 16+2*PIXEL_PADDING;
  var ctx = canvas.getContext('2d');
  var faviconLoop;

  var _load_game = load_game;
  globals.load_game = function(game_data, startWithTitle) {
    _load_game.apply(this, arguments);
    startFaviconLoop();
  };

  var _stopGame = stopGame;
  globals.stopGame = function() {
    _stopGame.apply(this, arguments);
    stopFaviconLoop();
  }

  function startFaviconLoop() {
    var frameCount = getFrames(SPRITE_NAME).length;
    if (frameCount === 1) {
      return drawFavicon();
    }

    var i = 0;
    faviconLoop = setInterval(function() {
      i = i % frameCount;
      drawFavicon(i++);
    }, FRAME_DELAY);
  }

  function stopFaviconLoop() {
    clearInterval(faviconLoop);
  }

  function drawFavicon(frameNum = 0) {
    var pal = getPalette(PALETTE_ID);
    var bgColor = pal && pal[BG_COLOR_NUM] || [20,20,20];
    var spriteColor = pal && pal[FG_COLOR_NUM] || [245,245,245];
    var frames = getFrames(SPRITE_NAME);
    var frame = frames[frameNum] || frames[0];
    var rounding_offset = ROUNDED_CORNERS ? 2 : 0;

    // Fill background color.
    ctx.fillStyle = 'rgb(' + bgColor.join(',') + ')';
    ctx.fillRect(rounding_offset,
                 0,
                 (16-2*rounding_offset)+2*PIXEL_PADDING,
                 16+2*PIXEL_PADDING);
    ctx.fillRect(0,
                 rounding_offset,
                 16+2*PIXEL_PADDING,
                 (16-2*rounding_offset)+2*PIXEL_PADDING);

    // Draw sprite foreground.
    ctx.fillStyle = 'rgb(' + spriteColor.join(',') + ')';
    for (var y in frame) {
      for (var x in frame[y]) {
        if (frame[y][x] === 1) ctx.fillRect(x*2+PIXEL_PADDING,y*2+PIXEL_PADDING,2,2);
      }
    }

    updateBrowserFavicon();
  }

  function updateBrowserFavicon() {
    // Add or modify favicon link tag in document.
    var link = document.querySelector('#favicon');
    if (!link) {
      link = document.createElement('link');
      link.id = 'favicon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL("image/x-icon");
  }

  function getFrames(name) {
    var spriteId = names.sprite.get(name) || playerId;
    var spriteData = sprite[spriteId];
    var frames = imageStore.source[spriteData.drw];
    return frames;
  }

  function getPalette(id) {
    var pal = [];

    if (Number.isNaN(Number(id))) {
      // `palette` is an object with numbers as keys. Yuck. Search by name.
      for (var i = 0; i < Object.keys(palette).length; i++) {
        if (palette[i].name === PALETTE_ID) {
          pal = palette[i];
          break;
        }
      }
    } else {
      // Find palette by number.
      pal = getPal(id);
    }

    return pal.colors;
  }
})(window);

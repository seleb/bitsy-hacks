/*
  ==============================
  SPRITE FAVICON MOD (@mildmojo)
  ==============================

  Use one of your game sprites as the page favicon. It'll even animate if the
  sprite has multiple frames!

  HOW TO USE:
    1. Copy-paste this script into a new script tag after the Bitsy source code.
    2. Edit the configuration below to set which sprite and colors this mod
       should use for the favicon. By default, it will render the player avatar
       sprite in the first available palette's colors.

  Version: 1.0
  Bitsy Version: 4.5, 4.6
  License: WTFPL (do WTF you want)
*/

// Give a hoot, don't pollute; encapsulate in an IIFE for isolation.
(function(globals) {
  'use strict';

  // CONFIGURATION FOR FAVICON

  // Sprite name as entered in editor (not case-sensitive). Defaults to player avatar.
  var SPRITE_NAME = '';
  // Palette name or number to draw colors from. (Names not case-sensitive.)
  var PALETTE_ID = 0;
  // Favicon background color in palette. 0 = BG, 1 = Tile, 2 = Sprite.
  var BG_COLOR_NUM = 0;
  // Favicon sprite color in palette. 0 = BG, 1 = Tile, 2 = Sprite.
  var FG_COLOR_NUM = 2;
  // Padding around sprite, in Bitsy pixel units.
  var PIXEL_PADDING = 1;
  // Should the favicon have rounded corners? (Suggest margin 2px if rounding.)
  var ROUNDED_CORNERS = true;
  // Frame change interval (ms) if sprite is animated. Use `Infinity` to disable.
  var FRAME_DELAY = 400;

  // END CONFIG

  var FAVICON_SIZE = 16; // pixels
  var ONE_PIXEL_SCALED = FAVICON_SIZE / tilesize;
  PIXEL_PADDING *= ONE_PIXEL_SCALED;
  var canvas = document.createElement('canvas');
  canvas.width = FAVICON_SIZE + 2*PIXEL_PADDING;
  canvas.height = FAVICON_SIZE + 2*PIXEL_PADDING;
  var ctx = canvas.getContext('2d');
  var faviconLinkElem;
  var faviconFrameURLs = [];
  var isStarted = false;

  after('load_game', startFaviconLoop);

  function startFaviconLoop() {
    if (isStarted) return;
    isStarted = true;
    
    var frameNum = 0;
    var frames = getFrames(SPRITE_NAME);

    faviconFrameURLs = frames.map(drawFrame);

    // Only one frame? Don't even bother with the loop, just paint the icon once.
    if (frames.length === 1) {
      return updateBrowserFavicon(faviconFrameURLs[0]);
    }

    setInterval(function() {
      frameNum = ++frameNum % frames.length;
      updateBrowserFavicon(faviconFrameURLs[frameNum]);
    }, FRAME_DELAY);
  }

  function drawFrame(frameData) {
    var pal = getPalette(PALETTE_ID);
    var bgColor = pal && pal[BG_COLOR_NUM] || [20,20,20];
    var spriteColor = pal && pal[FG_COLOR_NUM] || [245,245,245];
    var rounding_offset = ROUNDED_CORNERS ? ONE_PIXEL_SCALED : 0;

    // Approximate a squircle-shaped background by drawing a fat plus sign with
    // two overlapping rects, leaving some empty pixels in the corners.
    var longSide = FAVICON_SIZE + 2*PIXEL_PADDING;
    var shortSide = longSide - rounding_offset*ONE_PIXEL_SCALED;
    ctx.fillStyle = rgb(bgColor);
    ctx.fillRect(rounding_offset,
                 0,
                 shortSide,
                 longSide);
    ctx.fillRect(0,
                 rounding_offset,
                 longSide,
                 shortSide);

    // Draw sprite foreground.
    ctx.fillStyle = rgb(spriteColor);
    for (var y in frameData) {
      for (var x in frameData[y]) {
        if (frameData[y][x] === 1) {
          ctx.fillRect(x*ONE_PIXEL_SCALED + PIXEL_PADDING,
                       y*ONE_PIXEL_SCALED + PIXEL_PADDING,
                       ONE_PIXEL_SCALED,
                       ONE_PIXEL_SCALED);
        }
      }
    }

    return canvas.toDataURL("image/x-icon");
  }

  function updateBrowserFavicon(dataURL) {
    // Add or modify favicon link tag in document.
    faviconLinkElem = faviconLinkElem || document.querySelector('#favicon');
    if (!faviconLinkElem) {
      faviconLinkElem = document.createElement('link');
      faviconLinkElem.id = 'favicon';
      faviconLinkElem.type = 'image/x-icon';
      faviconLinkElem.rel = 'shortcut icon';
      document.head.appendChild(faviconLinkElem);
    }
    faviconLinkElem.href = dataURL;
  }

  function getFrames(spriteName) {
    // `spriteName` is case insensitive to avoid Bitsydev headaches.
    var spriteKey = Object.keys(sprite).find(function(key) {
      return sprite[key].name && sprite[key].name.toLowerCase() === spriteName.toLowerCase();
    });
    var spriteData = sprite[spriteKey || playerId];
    var frames = imageStore.source[spriteData.drw];
    return frames;
  }

  function getPalette(id) {
    var palId = id;

    if (Number.isNaN(Number(palId))) {
      // Search palettes by name. `palette` is an object with numbers as keys. Yuck.
      // Palette names are case-insensitive to avoid Bitsydev headaches.
      palId = Object.keys(palette).find(function(i) {
        return palette[i].name && palette[i].name.toLowerCase() === palId.toLowerCase();
      });
    }

    return getPal(palId);
  }

  // Expects values = [r, g, b]
  function rgb(values) {
    return 'rgb(' + values.join(',') + ')';
  }

  function after(functionName, afterFn) {
    var superFn = globals[functionName];

    globals[functionName] = function() {
      superFn.apply(this, arguments);
      afterFn.apply(this, arguments);
    };
  }

})(window);

/**
@file transform avatar
@summary Helpers for flipping and rotating the avatar sprite
*/

import bitsy from "bitsy";
import {
	getSpriteData,
	setSpriteData
} from "./edit image at runtime";

// copied from https://stackoverflow.com/a/46805290
function transpose(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const grid = [];
  for (let j = 0; j < cols; j++) {
    grid[j] = Array(rows);
  }
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[j][i] = matrix[i][j];
    }
  }
  return grid;
}

function transformSpriteData(spriteData, flipVertically, flipHorizontally, rotate) {
	var x, y, x2, y2, col, tmp;
	var s = spriteData.slice();
	if (flipVertically) {
		for (y = 0; y < s.length / 2; ++y) {
			y2 = s.length - y - 1;
			tmp = s[y];
			s[y] = s[y2];
			s[y2] = tmp;
		}
	}
	if (flipHorizontally) {
		for (y = 0; y < s.length; ++y) {
			col = s[y] = s[y].slice();
			for (x = 0; x < col.length / 2; ++x) {
				x2 = col.length - x - 1;
				tmp = col[x];
				col[x] = col[x2];
				col[x2] = tmp;
			}
		}
	}
	if (rotate) {
		s = transpose(s);
	}
	return s;
}

export function transformAvatar(originalAnimation, vflip, hflip, rotate) {
  var i;
  // save the original frames
  if (!originalAnimation || originalAnimation.referenceFrame !== getSpriteData(bitsy.playerId, 0)) {
    originalAnimation = {
      frames: []
    };
    for (i = 0; i < bitsy.player().animation.frameCount; ++i) {
      originalAnimation.frames.push(getSpriteData(bitsy.playerId, i));
    }
  }

  // update sprite with transformed frames
  for (i = 0; i < originalAnimation.frames.length; ++i) {
    setSpriteData(bitsy.playerId, i, transformSpriteData(originalAnimation.frames[i], vflip, hflip, rotate));
  }
  originalAnimation.referenceFrame = getSpriteData(bitsy.playerId, 0);
}

/**
@file transform sprite data
@summary Helpers for flipping and rotating sprite data
*/

import bitsy from "bitsy";

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

// helper function to flip sprite data
export function transformSpriteData(spriteData, v, h, rot) {
	var x, y, x2, y2, col, tmp;
	var s = spriteData.slice();
	if (v) {
		for (y = 0; y < s.length / 2; ++y) {
			y2 = s.length - y - 1;
			tmp = s[y];
			s[y] = s[y2];
			s[y2] = tmp;
		}
	}
	if (h) {
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
	if (rot) {
		s = transpose(s);
	}
	return s;
}

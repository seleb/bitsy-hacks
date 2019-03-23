/**
🛰
@file external-game-data
@summary separate Bitsy game data from your (modded) HTML for easier development
@license WTFPL (do WTF you want)
@version 2.1.1
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
Load your Bitsy game data from an external file or URL, separating it from your
(modified) Bitsy HTML.

Usage: IMPORT <file or URL>

Examples: IMPORT frontier.bitsydata
          IMPORT http://my-cool-website.nz/frontier/frontier.bitsydata
          IMPORT /games/frontier/data/frontier.bitsydata

HOW TO USE:
  1. Copy-paste this script into a new script tag after the Bitsy source code.
     Make sure this script comes *after* any other mods to guarantee that it
     executes first.
  2. Copy all your Bitsy game data out of the script tag at the top of your
     HTML into another file (I recommend `game-name.bitsydata`). In the HTML
     file, replace all game data with a single IMPORT statement that refers to
     your new data file.

NOTE: Chrome can only fetch external files when they're served from a
      web server, so your game won't work if you just open your HTML file from
      disk. You could use Firefox, install a web server, or, if you have
      development tools like NodeJS, Ruby, Python, Perl, PHP, or others
      installed, here's a big list of how to use them to serve a folder as a
      local web server:
      https://gist.github.com/willurd/5720255

      If this mod finds an IMPORT statement anywhere in the Bitsy data
      contained in the HTML file, it will replace all game data with the
      IMPORTed data. It will not execute nested IMPORT statements in
      external files.
*/
'use strict';
import bitsy from "bitsy";
import {
	before
} from "./helpers/kitsy-script-toolkit";

var ERR_MISSING_IMPORT = 1;

before('startExportedGame', function (done) {
	var gameDataElem = document.getElementById('exportedGameData');

	tryImportGameData(gameDataElem.text, function withGameData(err, importedData) {
		if (err && err.error === ERR_MISSING_IMPORT) {
			console.warn(err.message);
		} else if (err) {
			console.warn('Make sure game data IMPORT statement refers to a valid file or URL.');
			throw err;
		}

		gameDataElem.text = "\n" + dos2unix(importedData);
		done();
	});
});

function tryImportGameData(gameData, done) {
	// Make sure this game data even uses the word "IMPORT".
	if (gameData.indexOf('IMPORT') === -1) {
		return done({
			error: ERR_MISSING_IMPORT,
			message: 'No IMPORT found in Bitsy data. See instructions for external game data mod.'
		}, gameData);
	}

	var trim = function (line) {
		return line.trim();
	};
	var isImport = function (line) {
		return bitsy.getType(line) === 'IMPORT';
	};
	var importCmd = gameData
	.split("\n")
	.map(trim)
	.find(isImport);

	// Make sure we found an actual IMPORT command.
	if (!importCmd) {
		return done({
			error: ERR_MISSING_IMPORT,
			message: 'No IMPORT found in Bitsy data. See instructions for external game data mod.'
		});
	}

	var src = (importCmd || '').split(/\s+/)[1];

	if (src) {
		return fetchData(src, done);
	} else {
		return done('IMPORT missing a URL or path to a Bitsy data file!');
	}
}

function fetchData(url, done) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function () {
		if (this.status >= 200 && this.status < 400) {
			// Success!
			return done(null, this.response);
		} else {
			return done('Failed to load game data: ' + request.statusText + ' (' + this.status + ')');
		}
	};

	request.onerror = function () {
		return done('Failed to load game data: ' + request.statusText);
	};

	request.send();
}

function dos2unix(text) {
	return text.replace(/\r\n/g, "\n");
}

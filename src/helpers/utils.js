/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
*/

import bitsy from 'bitsy';

/*
Helper used to replace code in a script tag based on a search regex
To inject code without erasing original string, using capturing groups; e.g.
	inject(/(some string)/,'injected before $1 injected after')
*/
export function inject(searchRegex, replaceString) {
	// find the relevant script tag
	var scriptTags = document.getElementsByTagName('script');
	var scriptTag;
	var code;
	for (var i = 0; i < scriptTags.length; ++i) {
		scriptTag = scriptTags[i];
		var matchesSearch = scriptTag.textContent.search(searchRegex) !== -1;
		var isCurrentScript = scriptTag === document.currentScript;
		if (matchesSearch && !isCurrentScript) {
			code = scriptTag.textContent;
			break;
		}
	}

	// error-handling
	if (!code) {
		throw new Error('Couldn\'t find "' + searchRegex + '" in script tags');
	}

	// modify the content
	code = code.replace(searchRegex, replaceString);

	// replace the old script tag with a new one using our modified code
	var newScriptTag = document.createElement('script');
	newScriptTag.textContent = code;
	scriptTag.insertAdjacentElement('afterend', newScriptTag);
	scriptTag.remove();
}

/*
Helper for getting image by name or id

Args:
	name: id or name of image to return
	 map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: the image in the given map with the given name/id
 */
export function getImage(name, map) {
	var id = Object.prototype.hasOwnProperty.call(map, name) ? name : Object.keys(map).find(function (e) {
		return map[e].name === name;
	});
	return map[id];
}

/**
 * Helper for getting room by name or id
 * @param {string} name id or name of room to return
 * @return {string} room, or undefined if it doesn't exist
 */
export function getRoom(name) {
	var id = Object.prototype.hasOwnProperty.call(bitsy.room, name)
		? name
		: (
			Object.values(bitsy.room).find(function (room) {
				return room.name === name;
			}) || {}
		).id;
	return bitsy.room[id];
}

/**
 * Helper for getting an array with unique elements
 * @param  {Array} array Original array
 * @return {Array}       Copy of array, excluding duplicates
 */
export function unique(array) {
	return array.filter(function (item, idx) {
		return array.indexOf(item) === idx;
	});
}

/**
 * Helper for printing dialog inside of a dialog function.
 * Intended to be called using the environment + onReturn parameters of the original function;
 * e.g.
 * addDialogTag('myTag', function (parameters, onReturn) {
 * 	printDialog('my text', onReturn);
 * });
 * @param {Environment} environment Bitsy environment object; first param to a dialog function
 * @param {String} text Text to print
 * @param {Function} onReturn Bitsy onReturn function; third param to a dialog function
 */
export function printDialog(text, onReturn) {
	bitsy.dialogBuffer.AddText(text, function () {
		onReturn(false);
	});
}

/**
 * Helper for parsing parameters that may be relative to another value
 * e.g.
 * - getRelativeNumber('1', 5) -> 1
 * - getRelativeNumber('+1', 5) -> 6
 * - getRelativeNumber('-1', 5) -> 4
 * - getRelativeNumber('', 5) -> 5
 * @param {string} value absolute or relative string to parse
 * @param {number} relativeTo value to use as fallback if none is provided, and as base for relative value
 * @return {number} resulting absolute or relative number
 */
export function getRelativeNumber(value, relativeTo) {
	var v = (value || value === 0 ? value : relativeTo);
	if (typeof v === 'string' && (v.startsWith('+') || v.startsWith('-'))) {
		return relativeTo + Number(v);
	}
	return Number(v);
}

/**
 * @param {number} value number to clamp
 * @param {number} min minimum
 * @param {number} max maximum
 * @return min if value < min, max if value > max, value otherwise
 */
export function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

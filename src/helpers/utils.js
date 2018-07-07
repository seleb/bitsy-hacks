/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
*/

import bitsy from "bitsy";

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
		throw 'Couldn\'t find "' + searchRegex + '" in script tags';
	}

	// modify the content
	code = code.replace(searchRegex, replaceString);

	// replace the old script tag with a new one using our modified code
	var newScriptTag = document.createElement('script');
	newScriptTag.textContent = code;
	scriptTag.insertAdjacentElement('afterend', newScriptTag);
	scriptTag.remove();
}

/*helper for exposing getter/setter for private vars*/
var indirectEval = eval;
export function expose(target) {
	var code = target.toString();
	code = code.substring(0, code.lastIndexOf("}"));
	code += "this.get = function(name) {return eval(name);};";
	code += "this.set = function(name, value) {eval(name+'=value');};";
	return indirectEval("[" + code + "}]")[0];
}

/*
Helper for getting image by name or id

Args:
	name: id or name of image to return
	 map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: the image in the given map with the given name/id
 */
export function getImage(name, map) {
	var id = map.hasOwnProperty(name) ? name : Object.keys(map).find(function (e) {
		return map[e].name == name;
	});
	return map[id];
}

/**
 * Helper for getting room by name or id
 * @param {string} name id or name of room to return
 * @return {string} room, or undefined if it doesn't exist
 */
export function getRoom(name) {
	var id = bitsy.room.hasOwnProperty(name) ? name : bitsy.names.room.get(name);
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
 * addDialogTag('myTag', function (environment, parameters, onReturn) {
 * 	printDialog(environment, 'my text', onReturn);
 * });
 * @param {Environment} environment Bitsy environment object; first param to a dialog function
 * @param {String} text Text to print
 * @param {Function} onReturn Bitsy onReturn function; third param to a dialog function
 */
export function printDialog(environment, text, onReturn) {
	environment.GetDialogBuffer().AddText(text, function() {
		onReturn(null);
	});
}

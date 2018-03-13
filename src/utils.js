/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
*/

/*helper used to inject code into script tags based on a search string*/
export function inject(searchString, codeToInject) {
	// find the relevant script tag
	var scriptTags = document.getElementsByTagName('script');
	var scriptTag;
	var code;
	for (var i = 0; i < scriptTags.length; ++i) {
		scriptTag = scriptTags[i];
		if (
			scriptTag.textContent.indexOf(searchString) >= 0 // script contains the search string
			&&
			scriptTag != document.currentScript // script isn't the one doing the injecting (which also contains the search string)
		) {
			code = scriptTag.textContent;
			break;
		}
	}

	// error-handling
	if (!code) {
		throw 'Couldn\'t find "' + searchString + '" in script tags';
	}

	// modify the content
	code = code.replace(searchString, searchString + codeToInject);

	// replace the old script tag with a new one using our modified code
	scriptTag.remove();
	scriptTag = document.createElement('script');
	scriptTag.textContent = code;
	document.head.appendChild(scriptTag);
}

/*helper for exposing getter/setter for private vars*/
export function expose(target) {
	var code = target.toString();
	code = code.substring(0, code.lastIndexOf("}"));
	code += "this.get = function(name) {return eval(name);};";
	code += "this.set = function(name, value) {eval(name+'=value');};";
	return eval("[" + code + "}]")[0];
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
 * Helper for getting an array with unique elements 
 * @param  {Array} array Original array
 * @return {Array}       Copy of array, excluding duplicates
 */
export function unique(array) {
	return array.filter(function (item, idx) {
		return array.indexOf(item) === idx;
	});
}
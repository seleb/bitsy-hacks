/*
bitsy hack - custom font exporter

Overrides bitsy's font with custom data.

Font data in bitsy is stored in a big 1-bit array called `fontdata`.
Individual letters are 6x8 slices of the array in stored according to ascii order.
e.g. the letter "A" is 65th, and looks like:

	0,0,1,1,1,0,
	0,1,0,0,0,1,
	0,1,0,0,0,1,
	0,1,0,0,0,1,
	0,1,1,1,1,1,
	0,1,0,0,0,1,
	0,1,0,0,0,1,
	0,0,0,0,0,0,

HOW TO USE
1. Replace 'FONT_DATA_PLACEHOLDER' with actual font data (this is done automatically if using the accompanying converter page)
2. Copy-paste into a script tag after the bitsy source
*/
function () {
	// helper used to expose getter/setter for private vars
	var expose = function (target) {
		var code = target.toString();
		code = code.substring(0, code.lastIndexOf("}"));
		code += "this.get = function(name) {return eval(name);};";
		code += "this.set = function(name, value) {eval(name+'=value');};";
		return eval("[" + code + "}]")[0];
	};

	var fontdata = [
		'FONT_DATA_PLACEHOLDER'
	];

	// apply fontdata
	dialogRenderer = new(expose(dialogRenderer.constructor))();
	var font = dialogRenderer.get('font');
	font = new(expose(font.constructor))();
	font.set('fontdata', fontdata);
	dialogRenderer.set('font', font);
}
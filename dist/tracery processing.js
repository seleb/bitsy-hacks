/*
bitsy hack - tracery processing

Adds support for processing all dialog text with a tracery grammar.

This isn't a self-contained hack; it relies on https://github.com/galaxykate/tracery/tree/tracery2
to handle the processing, and this is simply the code needed to integrate for bitsy.

Use cases for this mostly overlap with the existing bitsy scripting capabilities now,
but it's also a nice minimal example of hacking features into bitsy.

HOW TO USE:
1. Copy https://github.com/galaxykate/tracery/blob/tracery2/js/tracery/tracery.js into your game. You can either:
	- copy the contents into a script tag in the head
	- copy the file next to your html file and add a script tag with `src="tracery.js"` to the head
2. Copy-paste this script into a script tag after the bitsy source
3. Add your entries to the grammar object

TRACERY NOTES:
Tracery will look for symbols wrapped in hashes ("#"), and then use the entries in a provided
grammar object to "expand" them into the final text. For example, if you have the text and grammar
	"I'm a #animal#"
	+
	{animal: ['cat', 'dog']}
then the "#animal#" symbol will be replaced with a random entry from the grammar to create
	"I'm a cat" or "I'm a dog"

Symbols can be nested to easily add variety, e.g. the text and grammar
	"I'm a #thing#"
	+
	{
		thing: ['#animal#', '#adjective# #animal#']
		animal: ['cat', 'dog', 'mouse'],
		adjective: ['good', 'nice', 'powerful']
	}
can create
	"I'm a dog", "I'm a nice mouse", "I'm a powerful cat", etc.

See http://www.crystalcodepalace.com/traceryTut.html for more on how to use tracery
*/
(function () {
'use strict';


var grammar = tracery.createGrammar({
	// put your grammar entries here
});
var _startDialog = startDialog;
startDialog = function(dialogStr) {
	dialogStr = grammar.flatten(dialogStr);
	if(_startDialog){
		_startDialog(dialogStr);
	}
};

}());

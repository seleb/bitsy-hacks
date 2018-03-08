/*
bitsy hack - tracery processing

Adds support for processing all dialog text with a tracery grammar.

Use cases for this mostly overlap with the existing bitsy scripting capabilities now,
but it's also a nice minimal example of hacking features into bitsy,
and of how to import a third-party dependency into a hack.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Add your entries to the `bitsyGrammar` object near the bottom of the file

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
import bitsy from "bitsy";

import tracery from "tracery-grammar";

var bitsyGrammar = tracery.createGrammar({
	// put your grammar entries here
});
var _startDialog = bitsy.startDialog;
bitsy.startDialog = function(dialogStr) {
	dialogStr = bitsyGrammar.flatten(dialogStr);
	if(_startDialog){
		_startDialog(dialogStr);
	}
};
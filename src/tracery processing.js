/**
🏰
@file tracery processing
@summary process all dialog text with a tracery grammar
@license MIT
@author Sean S. LeBlanc

@description
Adds support for processing all dialog text with a tracery grammar.

Use cases for this mostly overlap with the existing bitsy scripting capabilities now,
but it's also a nice minimal example of hacking features into bitsy,
and of how to import a third-party dependency into a hack.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Add your entries to the `hackOptions` object below

TRACERY NOTES:
Tracery will process the all dialog text using its syntax,
which includes special characters such as "#", ":", "[", and "]"
(these can be escaped by putting "\\" in front of them)

The most common use will be symbols wrapped in hashes ("#"), which use the entries in a provided
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
		thing: ['#animal#', '#adjective# #animal#'],
		animal: ['cat', 'dog', 'mouse'],
		adjective: ['good', 'nice', 'powerful']
	}
can create
	"I'm a dog", "I'm a nice mouse", "I'm a powerful cat", etc.

See http://www.crystalcodepalace.com/traceryTut.html for more on how to use tracery
*/
import tracery from 'tracery-grammar';
import { before, inject } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	grammar: {
		// put your grammar entries here
	},
	// modifiers to include (if this is not provided, the default tracery-provided modifiers like `.capitalize` are used)
	modifiers: undefined,
};

var bitsyGrammar;

before('onready', function () {
	bitsyGrammar = tracery.createGrammar(hackOptions.grammar);
	bitsyGrammar.addModifiers(hackOptions.modifiers || tracery.baseEngModifiers);
	window.tracery = window.tracery || bitsyGrammar.flatten.bind(bitsyGrammar);
});

// pre-process LiteralNode values with tracery grammar
inject(/onReturn\(this\.value\)/, 'onReturn(window.tracery(this.value))');

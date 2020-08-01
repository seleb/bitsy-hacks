/**
⌨
@file dialog prompt
@summary prompt the user for text input in dialog
@license MIT
@version auto
@requires 6.4
@author Sean S. LeBlanc

@description
Adds a dialog command which prompts the user for input,
and stores the result in a variable.

Note: This hack also includes the paragraph break hack;
this is because text after a dialog prompt won't show up unless
there is a paragraph break in between them.

Usage:
	(prompt "variableName")
	(prompt "variableName,defaultValue")

Examples:
	Set name: (prompt "name")
	Set name with default: (prompt "name,Adam")
	Set name using current as default: {temp="name,"+name}(prompt temp)
	Set name with text after: (prompt "name")(p)Name is now {print name}

By default, no validation or transformation is applied to the user input;
whatever they submit (even a blank input) is used as the variable value.
This can be adjusted in the hackOptions to create prompts which are constrained.

Example:

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/

import bitsy from 'bitsy';
import {
	inject,
	before,
	addDialogTag,
} from './helpers/kitsy-script-toolkit';
import './paragraph-break';

export var hackOptions = {
	// character used to indicate caret
	caret: '_',
	// character used to indicate highlighted text
	highlight: '█',
	// function run when the prompt is submitted
	// whatever is returned from this function will be saved as the variable value
	// if an error is thrown, the prompt will not submit
	// (this can be used for validation, but keep in mind there's no user feedback)
	// `variable` can be used to apply different behaviour for different variable prompts
	// `value` is the current value of the text field
	onSubmit: function (variable, value) {
		return value; // allow any input
		// return value.toLowerCase(); // convert input to lowercase
		// if (value.length === 0) { throw new Error(); } return value; // require non-blank input
		// if (variable === 'name' && value.length === 0) { throw new Error(); } return value; // require non-blank input for 'name' only
	},
};

var cachedBuffer;
var prompted = false;

// helper for making a deep copy of dialog buffer
function bufferCopy(buffer) {
	return buffer.map(function (page) {
		return page.map(function (row) {
			return row.slice();
		});
	});
}

// manipulates dialog buffer to show the state of the form input in bitsy
function updateInputDisplay() {
	// reset to state at start of prompt
	bitsy.dialogBuffer.SetBuffer(bufferCopy(cachedBuffer));
	var highlight = promptInput.selectionEnd - promptInput.selectionStart;
	var str = promptInput.value;
	// insert caret/replace highlighted text
	str = str.substring(0, promptInput.selectionStart) + (highlight > 0 ? hackOptions.highlight.repeat(highlight) : hackOptions.caret) + str.substr(promptInput.selectionEnd);

	// show text
	bitsy.dialogBuffer.AddText(str);
	bitsy.dialogBuffer.Skip();
}

var promptForm = document.createElement('form');
// prevent form from affecting layout
promptForm.style.position = 'absolute';
promptForm.style.top = '50%';
promptForm.style.left = '50%';
promptForm.style.maxWidth = '25vh';
promptForm.style.maxHeight = '25vh';
promptForm.style.zIndex = '-1';

var promptInput = document.createElement('input');
promptInput.type = 'text';
promptInput.oninput = promptInput.onkeyup = updateInputDisplay;
promptInput.onblur = function () {
	if (prompted) {
		this.focus();
	}
};
// prevent zoom on focus
promptInput.style.fontSize = '200%';
// hide element without preventing input
promptInput.style.maxWidth = '100%';
promptInput.style.maxHeight = '100%';
promptInput.style.padding = '0';
promptInput.style.margin = '0';
promptInput.style.border = 'none';
promptInput.style.outline = 'none';

promptForm.appendChild(promptInput);
before('onready', function () {
	document.body.appendChild(promptForm);
});

addDialogTag('prompt', function (environment, parameters, onReturn) {
	prompted = true;

	// parse parameters
	var params = parameters[0].split(/,\s?/);
	var variableName = params[0];
	var defaultValue = params[1] || '';

	// prevent bitsy from handling input
	var key = bitsy.key;
	var isPlayerEmbeddedInEditor = bitsy.isPlayerEmbeddedInEditor;
	var anyKeyPressed = bitsy.input.anyKeyPressed;
	var isTapReleased = bitsy.input.isTapReleased;
	var CanContinue = environment.GetDialogBuffer().CanContinue;
	bitsy.key = {};
	bitsy.input.anyKeyPressed = bitsy.input.isTapReleased = environment.GetDialogBuffer().CanContinue = function () { return false; };
	bitsy.isPlayerEmbeddedInEditor = true;

	promptInput.value = defaultValue;
	promptInput.focus();
	promptForm.onsubmit = function (event) {
		event.preventDefault();
		try {
			var value = hackOptions.onSubmit(variableName, promptInput.value);
			environment.SetVariable(variableName, value);
		} catch (error) {
			return;
		}

		prompted = false;
		promptInput.blur();

		// allow bitsy to start handling input again
		bitsy.key = key;
		bitsy.isPlayerEmbeddedInEditor = isPlayerEmbeddedInEditor;
		bitsy.input.anyKeyPressed = anyKeyPressed;
		bitsy.input.isTapReleased = isTapReleased;
		environment.GetDialogBuffer().CanContinue = CanContinue;

		onReturn(null);
	};
	// save a copy of the current buffer state for display purposes
	cachedBuffer = bufferCopy(environment.GetDialogBuffer().GetBuffer());
	// add a caret character immediately (otherwise it won't show up till a key is pressed)
	environment.GetDialogBuffer().AddText(hackOptions.caret);
});

// expose a setter/getter for private buffer in DialogBuffer class
inject(/(this\.CurPage =)/, 'this.GetBuffer = function(){ return buffer; };this.SetBuffer = function(b){ buffer = b; };\n$1');

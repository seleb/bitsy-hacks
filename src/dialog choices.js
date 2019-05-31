/**
🔀
@file dialog choices
@summary binary dialog choices
@license MIT
@version 2.1.0
@requires 5.3
@author Sean S. LeBlanc

@description
Adds a dialog tag which allows you to present the player with binary dialog choices.
Uses as an arrow cursor by default, but this can be changed in the hackOptions to use a custom bitsy sprite instead.

Usage:
{choice
	- option one
	  result of picking option
	- option two
	  result of picking option
}

Recommended uses:
DLG_simple_response
"""
Greeting text
{choice
	- Response one
	  answer to response one
	- Response two
	  answer to response two
}
"""

DLG_complex_response
"""
Greeting text
{choice
	- Response one
	  {a = 1}
	- Response two
	  {a = 2}
}
constant part of answer{
	- a == 1 ?
	  custom part based on response one
	- a == 2 ?
	  custom part based on response two
}
"""

Note: it's recommended you combine this hack
with the dialog jump hack for complex cases.

Limitations:
Each option must fit on a single line, or the interaction will break.

Checking the value of a variable set in an option
*immediately after the choice* will not work,
as it will evaluate before the player has selected
an option if there is no text inbetween the two.
e.g.
"""
{a = 1}
{choice
	- Response one
	  {a = 2}
	- Response two
	  {a = 3}
}
{
	- a == 1 ?
	  this will print
	- a == 2 ?
	  these will not
	- a == 3 ?
	  these will not
}
"""

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
import bitsy from "bitsy";
import {
	inject,
} from "./helpers/kitsy-script-toolkit";
import "./helpers/addParagraphBreak";

var hackOptions = {
	// if defined, the cursor is drawn as the sprite with the given id
	// e.g. use 'A' to use the player's avatar as a cursor
	// if not defined, uses an arrow graphic similar to the continue arrow
	cursor: undefined,
	// modifies the scale/position of the cursor
	// recommended combinations:
	// 	- scale: 4, y: 1, x: 0
	// 	- scale: 2, y: 3, x: 1
	// 	- scale: 2, y: 4, x: 0 + custom cursor
	transform: {
		scale: bitsy.scale,
		y: 1,
		x: 0,
	}
};

var dialogChoices = {
	choice: 0,
	choices: [],
	choicesActive: false,
	handleInput: function (dialogBuffer) {
		if (!this.choicesActive) {
			return false;
		}
		// navigate
		if (
			bitsy.input.isKeyDown(bitsy.key.up) ||
			bitsy.input.isKeyDown(bitsy.key.w) ||
			bitsy.input.swipeUp()
		) {
			this.choice -= 1;
			if (this.choice < 0) {
				this.choice += this.choices.length;
			}
			return false;
		}
		if (
			bitsy.input.isKeyDown(bitsy.key.down) ||
			bitsy.input.isKeyDown(bitsy.key.s) ||
			bitsy.input.swipeDown()
		) {
			this.choice = (this.choice + 1) % this.choices.length;
			return false;
		}
		// select
		if (
			this.choicesActive &&
			(
				bitsy.input.isKeyDown(bitsy.key.right) ||
				bitsy.input.isKeyDown(bitsy.key.d) ||
				bitsy.input.isKeyDown(bitsy.key.enter) ||
				bitsy.input.isKeyDown(bitsy.key.space) ||
				bitsy.input.swipeRight()
			)
		) {
			// evaluate choice
			this.choices[this.choice]();
			// reset
			this.choice = 0;
			this.choices = [];
			this.choicesActive = false;
			// get back into the regular dialog flow
			if (dialogBuffer.Continue()) {
				dialogBuffer.Update(0);
				// make sure to close dialog if there's nothing to say
				// after the choice has been made
				if (!dialogBuffer.CurCharCount()) {
					dialogBuffer.Continue();
				}
			}
			return true;
		}
		return false;
	}
};

var choiceCursorDefault = `[
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 0, 0],
	[0, 1, 1, 0, 0, 0, 0, 0],
	[0, 1, 1, 1, 0, 0, 0, 0],
	[0, 1, 1, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0]
]`;

bitsy.dialogChoices = dialogChoices;

// parsing
// (adds a new sequence node type)
inject(/(\|\| str === "shuffle")/, '$1 || str === "choice"');
inject(/(state\.curNode\.AddChild\( new ShuffleNode\( options \) \);)/, `$1
else if(sequenceType === "choice")
	state.curNode.AddChild( new ChoiceNode( options ) );
`);

inject(/(var ShuffleNode = )/,`
var ChoiceNode = function(options) {
	Object.assign( this, new TreeRelationship() );
	Object.assign( this, new SequenceBase() );
	this.type = "choice";
	this.options = options;
	options.forEach(function(option){
		var br = option.children.find(function(child){ return child.name === 'br'; });
		if (!br) {
			option.onSelect = [];
			return;
		}
		var idx = option.children.indexOf(br);
		option.onSelect = option.children.slice(idx+1);
		option.children = option.children.slice(0, idx);
	});

	this.Eval = function(environment,onReturn) {
		var lastVal = null;
		var i = 0;
		function evalChildren(children,done) {
			if(i < children.length) {
				children[i].Eval(environment, function(val) {
					environment.GetDialogBuffer().AddLinebreak();
					lastVal = val;
					i++;
					evalChildren(children,done);
				});
			}
			else {
				done();
			}
		}
		window.dialogChoices.choices = this.options.map(function(option){
			return function(){
				option.onSelect.forEach(function(child){
					child.Eval(environment, function(){});
				});
			};
		});
		if (environment.GetDialogBuffer().CurCharCount() > 0) {
			environment.GetDialogBuffer().AddParagraphBreak();
		}
		evalChildren(this.options, function() {
			environment.GetDialogBuffer().AddParagraphBreak();
			onReturn(lastVal);
		});
	}
}
$1`);


// rendering
// (re-uses existing arrow image data,
// but draws rotated to point at text)
inject(/(this\.DrawNextArrow = )/, `
this.DrawChoiceArrow = function() {
	var rows = ${hackOptions.cursor ? `renderer.GetImageSource(sprite['${hackOptions.cursor}'].drw)[sprite['${hackOptions.cursor}'].animation.frameIndex]` : choiceCursorDefault};
	var top = (${hackOptions.transform.y} + window.dialogChoices.choice * (textboxInfo.padding_vert + relativeFontHeight())) * scale;
	var left = ${hackOptions.transform.x}*scale;
	for (var y = 0; y < rows.length; y++) {
		var cols = rows[y];
		for (var x = 0; x < cols.length; x++) {
			if (cols[x]) {
				//scaling nonsense
				for (var sy = 0; sy < ${hackOptions.transform.scale}; sy++) {
					for (var sx = 0; sx < ${hackOptions.transform.scale}; sx++) {
						var pxl = 4 * ( ((top+(y*${hackOptions.transform.scale})+sy) * (textboxInfo.width*scale)) + (left+(x*${hackOptions.transform.scale})+sx) );
						textboxInfo.img.data[pxl+0] = 255;
						textboxInfo.img.data[pxl+1] = 255;
						textboxInfo.img.data[pxl+2] = 255;
						textboxInfo.img.data[pxl+3] = 255;
					}
				}
			}
		}
	}
};
$1`);
inject(/(this\.DrawTextbox\(\);)/, `
if (window.dialogChoices.choicesActive) {
	this.DrawChoiceArrow();
}
$1`);

// interaction
// (overrides the dialog skip/page flip)
inject(/(\/\* CONTINUE DIALOG \*\/)/, `$1
if(window.dialogChoices.handleInput(dialogBuffer)) {
	return;
} else `);
inject(/(this\.CanContinue = function\(\) {)/, `$1
if(window.dialogChoices.choices.length){
	window.dialogChoices.choicesActive = isDialogReadyToContinue;
	return false;
}
window.dialogChoices.choicesActive = false;
`);

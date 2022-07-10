/**
🔀
@file dialog choices
@summary dialog choices
@license MIT
@author Sean S. LeBlanc

@description
Adds a dialog tag which allows you to present the player with dialog choices.
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
Greeting text{choice
  - Response one
    answer to response one
  - Response two
    answer to response two
}
"""

DLG_complex_response
"""
Greeting text{choice
  - Response one
    {a = 1}
  - Response two
    {a = 2}
}constant part of answer{
  - a == 1 ?
    custom part based on response one
  - a == 2 ?
    custom part based on response two
}
"""

This hack includes the "long dialog" hack so that the textbox
automatically expands to allow for more than 2 choices.

Note: it's recommended you combine this hack
with the dialog jump hack for complex cases.

Limitations:
Each option must fit on a single line, or the cursor
may not line up with the selected option.

Checking the value of a variable set in an option
*immediately after the choice* will not work,
as it will evaluate before the player has selected
an option if there is no text in-between the two.
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
import bitsy from 'bitsy';
import './helpers/addParagraphBreak';
import { inject } from './helpers/kitsy-script-toolkit';
import { hackOptions as longDialog } from './long dialog';

export var hackOptions = {
	// if defined, the cursor is drawn as the sprite with the given id
	// e.g. replace with `getCursorSprite('A')` to use the player's avatar as a cursor
	// if not defined, uses an arrow graphic similar to the continue arrow
	cursor: getCursorSprite(),
	// modifies the position of the cursor
	transform: {
		y: 1,
		x: 0,
	},
	// long dialog options
	minRows: 2,
	maxRows: 2,
};
longDialog.minRows = hackOptions.minRows;
longDialog.maxRows = hackOptions.maxRows;

var dialogChoices = {
	choice: 0,
	choices: [],
	choicesActive: false,
	moved: true,
	handleInput: function (dialogBuffer) {
		if (!this.choicesActive) {
			return false;
		}
		var l = Math.max(this.choices.length, 1);
		// navigate
		if (bitsy.bitsy.button(bitsy.bitsy.BTN_UP)) {
			this.choice -= 1;
			if (this.choice < 0) {
				this.choice += l;
			}
			return false;
		}
		if (bitsy.bitsy.button(bitsy.bitsy.BTN_DOWN)) {
			this.choice = (this.choice + 1) % l;
			return false;
		}
		// select
		if (bitsy.bitsy.button(bitsy.bitsy.BTN_RIGHT)) {
			// evaluate choice
			this.choices[this.choice]();
			// reset
			this.choice = 0;
			this.choices = [];
			this.choicesActive = false;
			return true;
		}
		return false;
	},
};

bitsy.dialogChoices = dialogChoices;

function getCursorSprite(cursor) {
	return cursor
		? `renderer.GetDrawingSource(sprite['${cursor}'].drw)[sprite['${cursor}'].animation.frameIndex]`
		: `[
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 1, 0, 0, 0, 0, 0, 0],
		[0, 1, 1, 0, 0, 0, 0, 0],
		[0, 1, 1, 1, 0, 0, 0, 0],
		[0, 1, 1, 0, 0, 0, 0, 0],
		[0, 1, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0]
	]`;
}

// parsing
// (adds a new sequence node type)
inject(/(\|\| str === "shuffle")/, '$1 || str === "choice"');
inject(
	/(state\.curNode\.AddChild\(new ShuffleNode\(options\)\);\n.*})/,
	`$1
else if(sequenceType === "choice") {
	state.curNode.AddChild(new ChoiceNode(options));
}`
);

inject(
	/(function ShuffleNode\(options\) {)/,
	`
function ChoiceNode(options) {
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
		var prevRows = window.kitsy.longDialogOptions.maxRows;
		window.kitsy.longDialogOptions.maxRows = Infinity;
		function evalChildren(children,done) {
			if(i < children.length) {
				children[i].Eval(environment, function(val) {
					if (i === children.length - 1) {
						environment.GetDialogBuffer().AddParagraphBreak();
						environment.GetDialogBuffer().AddScriptReturn(function () {
							// end dialog if there's no content after the choice
							if (environment.GetDialogBuffer().CurCharCount() <= 1) {
								environment.GetDialogBuffer().EndDialog();
							}
						});
					} else {
						environment.GetDialogBuffer().AddLinebreak();
					}
					lastVal = val;
					i++;
					evalChildren(children,done);
				});
			}
			else {
				done();
				window.dialogChoices.choicesActive = true;
			}
		}
		window.dialogChoices.choices = this.options.map(function(option){
			return function(){
				window.kitsy.longDialogOptions.maxRows = prevRows;
				option.onSelect.forEach(function(child){
					child.Eval(environment, function(){});
				});
			};
		});
		if (environment.GetDialogBuffer().CurCharCount() > 0) {
			environment.GetDialogBuffer().AddParagraphBreak();
		}
		evalChildren(this.options, function () {
			onReturn(lastVal);
		});
	}
}
$1`
);

// rendering
// (re-uses existing arrow image data,
// but draws rotated to point at text)
inject(
	/(this\.DrawNextArrow = )/,
	`
this.DrawChoiceArrow = function() {
	var text_scale = getTextScale();
	var textboxScaleW = textboxInfo.width * text_scale;
	var textboxScaleH = textboxInfo.height * text_scale;
	var rows = ${hackOptions.cursor};
	var top = (${hackOptions.transform.y} + window.dialogChoices.choice * (textboxInfo.padding_vert + relativeFontHeight())) * text_scale;
	var left = ${hackOptions.transform.x}*text_scale;
	for (var y = 0; y < rows.length; y++) {
		var cols = rows[y];
		for (var x = 0; x < cols.length; x++) {
			if (cols[x]) {
				//scaling nonsense
				for (var sy = 0; sy < text_scale; sy++) {
					for (var sx = 0; sx < text_scale; sx++) {
						var px = left + (x * text_scale) + sx;
						var py = top + (y * text_scale) + sy;
						bitsy.set(bitsy.TEXTBOX, (py * textboxScaleW) + px, textArrowIndex);
					}
				}
			}
		}
	}
};
$1`
);
inject(
	/(if \(buffer.CanContinue\(\) && shouldDrawArrow\) {)/,
	`
if (window.dialogChoices.choicesActive) {
	this.DrawChoiceArrow();
}
$1`
);

// interaction
// (overrides the dialog skip/page flip)
inject(/(dialogBuffer.CanContinue)/, `(!window.dialogChoices.choicesActive || window.dialogChoices.handleInput(dialogBuffer)) && $1`);
inject(
	/(this\.CanContinue = function\(\) {)/,
	`$1
if(window.dialogChoices.choicesActive){
	return false;
}
`
);

// force redrawing textbox to avoid flickering issues
inject(/shouldClearTextbox = false;/, '');
inject(/char.redraw = false;/, '');
inject(/shouldDrawArrow = false;/, '');

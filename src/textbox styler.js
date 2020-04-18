/**
📐
@file textbox styler
@summary customize the style and properties of the textbox
@license MIT
@version 1.0.1
@requires Bitsy Version: 6.1
@author Dana Holdampf & Sean S. LeBlanc

@description
This hack lets you edit the appearance, position, and other properties of the textbox.
It lets you draw a border, replace the continue arrow, resize or reposition the box, recolor text or backgrounds, etc.
You can also use dialog tags to switch styles, or redefine style properties, from a dialog.

NOTE: This hack re-implements the functionality of the Long Dialog hack.
Since they modify the same code, don't use them both to avoid conflicts!
Like the Long Dialog hack, it also includes the paragraph break "(p)" dialog tag.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below, to define the default textbox style
3. Optionally, add additional alternate styles to the dialogStyles section

You can define custom style properties for the textbox in the hackOptions below.
- The topmost options are the default style properties, which are applied to the textbox initially.
- The dialogStyles section is used for defining alternate styles you can switch between.
- Use the dialog commands below to switch between styles, or change individual properties.

The Dialog Tags for switching textbox styles are as follows:
============================================================

-- SWITCH TEXTBOX STYLE, WITH UNDEFINED PROPERTIES BEING IGNORED ---------------

{textStyle "dialogStyle"}
{textStyleNow "dialogStyle"}

Information:
- Replaces current textbox style with a new set of style properties, as defined in the dialogStyles below.
- Only changes style properties that are defined in the dialogStyle. Undefined properties are left unchanged.

Parameters:
- dialogStyle:	id/name of a dialogStyle, as defined in the hackOptions below. (ex. "vanilla", "centered", "inverted", etc.)

-- SWITCH TEXTBOX STYLE, WITH UNDEFINED PROPERTIES REVERTING TO DEFAULTS -------

{setTextStyle "dialogStyle"}
{setTextStyleNow "dialogStyle"}

Information:
- As above, but any undefined style properties in the new dialogStyle revert to the default style properties.

Parameters:
- dialogStyle:	id/name of a dialog style, as defined in the hackOptions below. (ex. "vanilla", "centered", "inverted", etc.)

-- CHANGE AN INDIVIDUAL TEXTBOX STYLE PROPERTY ---------------------------------

{textProperty "styleProperty, styleValue"}
{textPropertyNow "styleProperty, styleValue"}

Information:
- Sets an individual textbox style property, to a given value. See the hackOptions below for valid properties and values.

Parameters:
- styleProperty:	id/name of a style property, as defined in the hackOptions below. (ex. "borderColor", "textboxWidth", "textSpeed", etc.)
- styleValue:		value to assign to the styleProperty, as defined in the hackOptions below. (ex. "[128,128,128,256]", "140", etc.)

-- REVERT TEXTBOX STYLE TO THE DEFAULT STYLE -----------------------------------

{resetTextStyle}
{resetTextStyleNow}

Information:
- Resets all style properties to the values in the default dialog style, as defined in the hackOptions below.

-- REVERT AN INDIVIDUAL TEXTBOX STYLE PROPERTY TO IT'S DEFAULT VALUE -----------

{resetProperty "styleProperty"}
{resetPropertyNow "styleProperty"}

Information:
- Resets an individual style property to it's default value, as defined in the hackOptions below.

Parameters:
- styleProperty:	id/name of a style property, as defined in the hackOptions below. (ex. "borderColor", "textboxWidth", "textSpeed", etc.)

-- SET OR MODIFY THE POSITION AND SIZE OF THE TEXTBOX TO AN ABSOLUTE VALUE -----

{textPosition "x, y, width, minLines, maxLines"}
{textPositionNow "x, y, width, minLines, maxLines"}

Information:
- Repositions and resizes the textbox, at an absolute position based on parameters.
- Calculates the necessary style properties and spacing for the textbox automatically.

Parameters:
- x, y:			The x and y coordinates of the top left corner. Measured in bitsy-scale pixels (0-128).
- width:		The width of the textbox. Measured in bitsy-scale pixels (0-128).
- minLines: 	The minimum number of lines to display on the textbox. Height resizes automatically.
- maxLines: 	The maximum number of lines to display on the textbox. Height resizes automatically.
				If any parameter is left blank, the textbox will use it's current values.
				If given a +/- value (+8, -40, etc) that value is adjusted relative to it's current value.

----------------------------------------------------------------

DIALOG TAG NOTES:
- Add "Now" to the end of these dialog tags to make the tag trigger mid-dialog, rather than after the current dialog is concluded.
- To reset a property or style to default values, you can also set a style or style property value to "default".
- NOTE: Changing the style after some text is already printed can break existing text.
- Colors are defined as 4 values, [red,green,blue,alpha], each ranging from 0-255.
- Alpha is opacity; colors can be translucent by reducing Alpha below 255. 0 is fully transparent.

Examples:
- {textStyleNow "center"} immediately applies a style defined below, which centers the textbox, without overriding other existing style properties.
- {setTextStyle "vertical"} after the current dialog ends, switches to a vertical textbox style, defined in dialogStyles.
- {textPropertyNow "textSpeed, 25"} immediately reduces the time to print each character to 25ms.
- {resetTextStyle} Once this text is finished, will reset the textbox to the default style.
- {resetPropertyNow "textScale"} Immediately restores the text scale property to the default setting.
- {textPosition "8, 8, 120"} Resizes the textbox to cover the entire screen, with 8 pixels of padding on every side.

TODO: For future versions
- Redraw existing textbox contents in new style, when switching, and then continue.
- Recalculate textbox's center position, considering textbox margins in center calculation?
*/

import {
	inject,
	addDialogTag,
	addDeferredDialogTag,
} from './helpers/kitsy-script-toolkit';
import './paragraph-break';

// Applies only a Style's defined attributes to the current textbox style.
// {style "StyleName"}
// {textStyleNow "StyleName"}
addDialogTag('textStyleNow', function (environment, parameters, onReturn) {
	textboxStyler.style(parameters[0]);
	onReturn(null);
});
addDeferredDialogTag('textStyle', function (environment, parameters) {
	textboxStyler.style(parameters[0]);
});

// Sets the current Style of the textbox (undefined attributes use Defaults instead)
// {setTextStyle "StyleName"}
// {setTextStyleNow "StyleName"}
addDialogTag('setTextStyleNow', function (environment, parameters, onReturn) {
	textboxStyler.setStyle(parameters[0]);
	onReturn(null);
});
addDeferredDialogTag('setTextStyle', function (environment, parameters) {
	textboxStyler.setStyle(parameters[0]);
});

// Applies the current Style of the textbox (undefined attributes use Defaults instead)
// {textProperty "StyleProperty, StyleValue"}
// {textPropertyNow "StyleProperty, StyleValue"}
addDialogTag('textPropertyNow', function (environment, parameters, onReturn) {
	var params = parameters[0].split(',');
	textboxStyler.setProperty(params[0], params[1]);
	onReturn(null);
});
addDeferredDialogTag('textProperty', function (environment, parameters) {
	var params = parameters[0].split(',');
	textboxStyler.setProperty(params[0], params[1]);
});

// Resets the Style of the textbox to the Default style.
// {resetTextStyle}
// {resetTextStyleNow}
addDialogTag('resetTextStyleNow', function (environment, parameters, onReturn) {
	textboxStyler.resetStyle();
	onReturn(null);
});
addDeferredDialogTag('resetTextStyle', function (environment, parameters) {
	textboxStyler.resetStyle();
});

// Resets a Style Property of the textbox to it's Default value.
// {resetTextProperty "StyleProperty"}
// {resetTextPropertyNow "StyleProperty"}
addDialogTag('resetTextPropertyNow', function (environment, parameters, onReturn) {
	textboxStyler.resetProperty(parameters[0]);
	onReturn(null);
});
addDeferredDialogTag('resetTextProperty', function (environment, parameters) {
	textboxStyler.resetProperty(parameters[0]);
});

// Repositions and resizes textbox at an absolute position, based on coordinates.
// {textPosition "x, y, width, minLines, maxLines"}
// {textPositionNow "x, y, width, minLines, maxLines"}
addDialogTag('textPositionNow', function (environment, parameters, onReturn) {
	var params = parameters[0].split(',');
	textboxStyler.textboxPosition(params[0], params[1], params[2], params[3], params[4]);
	onReturn(null);
});
addDeferredDialogTag('textPosition', function (environment, parameters) {
	var params = parameters[0].split(',');
	textboxStyler.textboxPosition(params[0], params[1], params[2], params[3], params[4]);
});

export var hackOptions = {
	// Determines where the textbox is positioned. "shift" moves the textbox based on the player's position.
	verticalPosition: 'shift', // options are "top", "center", "bottom", or "shift" (moves based on player position)
	horizontalPosition: 'center', // options are "left", "center", "right", or "shift" (moves based on player position)

	textboxColor: [0, 0, 0, 255], // Colors text and textbox are drawn, in [R,G,B,A]. TODO: Alpha doesn't presently work!
	textboxWidth: 120, // Width of textbox in pixels. Default 104.
	textboxMarginX: 4, // Pixels of space outside the left (or right) of the textbox. Default 12.
	textboxMarginY: 4, // Pixels of space outside the top (or bottom) of the textbox. Default 12.

	textColor: [255, 255, 255, 255], // Default color of text.
	textMinLines: 2, // Minimum number of rows for text. Determines starting textbox height. Default 2.
	textMaxLines: 2, // Maximum number of rows for text. Determines max textbox height. Default 2.
	textScale: 2, // Scaling factor for text. Default 2. Best with 1, 2, or 4.
	textSpeed: 50, // Time to print each character, in milliseconds. Default 50.
	textPaddingX: 0, // Default horizontal padding around the text.
	textPaddingY: 2, // Default vertical padding around the text.

	// Color the continue arrow is drawn using, in [R,G,B,A]
	arrowColor: [255, 255, 255, 255], // Foreground color of arrow sprite.
	arrowBGColor: [0, 0, 0, 255], // Background color. If transparent, draws no BG.

	// Position of textbox continue arrow, on bottom of textbox.
	arrowAlign: 'right', // Options are: "right", "center", or "left" aligned

	// Pixels of padding the arrow is inset from the edge by
	arrowInsetX: 12,
	arrowInsetY: 0,

	// Should match dimensions of the sprite below
	arrowWidth: 8, // Width of arrow sprite below, in pixels
	arrowHeight: 5, // Height of arrow sprite below, in pixels
	arrowScale: 2, // Scaling factor for arrow sprite. Default 2. Best with 1, 2, or 4.

	// Pixels defining the textbox continue arrow. 1 draws a pixel in main Color, 0 draws in BG Color.
	arrowSprite: [
		1, 1, 1, 1, 1, 1, 1, 1,
		0, 1, 1, 1, 1, 1, 1, 0,
		0, 0, 1, 1, 1, 1, 0, 0,
		0, 0, 0, 1, 1, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
	],
	// Colors the borders are drawn using, in [R,G,B,A].
	borderColor: [128, 128, 128, 255], // Foreground color for border tiles.
	borderMidColor: [51, 51, 51, 255], // Foreground color used for middle border tiles.
	borderBGColor: [0, 0, 0, 255], // Background color the border tiles. If transparent, draws no BG.

	// Border is drawn past the edges of the textbox.
	// Should match dimensions of the sprite below
	borderWidth: 8, // Width of border sprites, in pixels. Default 8.
	borderHeight: 8, // Height of border sprites, in pixels. Default 8.
	borderScale: 2, // Scaling factor for border sprites. Default 2. Best with 1, 2, or 4.

	// Pixels defining the corners and edges the border is drawn with. 1 draws a pixel in foreground color, 0 in BG.
	borderUL: [
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 1, 1, 1, 1, 1, 1,
		0, 0, 1, 1, 1, 1, 1, 1,
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 0, 0,
	],
	borderU: [
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
	],
	borderUR: [
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		1, 1, 1, 1, 1, 1, 0, 0,
		1, 1, 1, 1, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
	],
	borderL: [
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 0, 0,
	],
	borderR: [
		0, 0, 0, 0, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
	],
	borderDL: [
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 1, 1, 1, 1,
		0, 0, 1, 1, 1, 1, 1, 1,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
	],
	borderD: [
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
	],
	borderDR: [
		0, 0, 0, 0, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0,
		1, 1, 1, 1, 1, 1, 0, 0,
		1, 1, 1, 1, 1, 1, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
	],
	borderM: [
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
	],

	dialogStyles: {
	// You can define alternate Dialog Styles here, which can be switched to in-game from dialog.
	// These can be switched between using the (Style "styleName") or (ApplyStyle "styleName") commands.
	// These Dialog Styles are meant as examples. Feel free to edit, rename, or remove them.
		custom: {
		// Copy any hackOptions from above into this section, and modify them, to create a new Style.

		},
		vanilla: {
		// An example style, which emulates the original Bitsy textbox.
			verticalPosition: 'shift',
			horizontalPosition: 'center',
			textboxWidth: 104,
			textboxMarginX: 12,
			textboxMarginY: 12,
			textMinLines: 2,
			textMaxLines: 2,
			textPaddingX: 8,
			textPaddingY: 10,
			borderWidth: 0,
			borderHeight: 0,
			arrowScale: 4,
			arrowInsetX: 4,
			arrowInsetY: 1,
			arrowWidth: 5,
			arrowHeight: 3,
			arrowSprite: [
				1, 1, 1, 1, 1,
				0, 1, 1, 1, 0,
				0, 0, 1, 0, 0,
			],
		},
		centered: {
		// An example style, that centers the textbox as with Starting or Ending text.
			verticalPosition: 'center',
			horizontalPosition: 'center',
		},
		vertical: {
		// An example style, that positions the textbox vertically, on the left or right side.
			verticalPosition: 'center',
			horizontalPosition: 'shift',
			textboxWidth: 48,
			textMinLines: 16,
			textMaxLines: 16,
		},
		corner: {
		// An example style, which positions a resizing textbox in the corner opposite the player.
			verticalPosition: 'shift',
			horizontalPosition: 'shift',
			textboxWidth: 64,
			textMinLines: 1,
			textMaxLines: 8,
		},
		inverted: {
		// An example style, which inverts the normal textbox colors
			textboxColor: [255, 255, 255, 255],
			textColor: [0, 0, 0, 255],
			borderColor: [128, 128, 128, 255],
			borderMidColor: [204, 204, 204, 255],
			borderBGColor: [255, 255, 255, 255],
			arrowColor: [0, 0, 0, 255],
			arrowBGColor: [255, 255, 255, 255],
		},
		smallBorder: {
		// An example style, which uses a smaller border with a blue background.
			borderWidth: 4,
			borderHeight: 4,
			textPaddingX: 4,
			textPaddingY: 4,
			borderColor: [255, 255, 255, 255],
			borderBGColor: [51, 153, 204, 255],
			arrowBGColor: [51, 153, 204, 255],
			borderUL: [
				0, 0, 0, 0,
				0, 1, 1, 1,
				0, 1, 1, 0,
				0, 1, 0, 1,
			],
			borderU: [
				0, 0, 0, 0,
				1, 1, 1, 1,
				0, 0, 0, 0,
				0, 0, 0, 0,
			],
			borderUR: [
				0, 0, 0, 0,
				1, 1, 1, 0,
				0, 0, 1, 0,
				0, 1, 1, 0,
			],
			borderL: [
				0, 1, 0, 0,
				0, 1, 0, 0,
				0, 1, 0, 0,
				0, 1, 0, 0,
			],
			borderR: [
				1, 1, 1, 0,
				1, 1, 1, 0,
				1, 1, 1, 0,
				1, 1, 1, 0,
			],
			borderDL: [
				0, 1, 0, 0,
				0, 1, 0, 1,
				0, 1, 1, 1,
				0, 0, 0, 0,
			],
			borderD: [
				1, 1, 1, 1,
				1, 1, 1, 1,
				1, 1, 1, 1,
				0, 0, 0, 0,
			],
			borderDR: [
				0, 1, 1, 0,
				1, 0, 1, 0,
				1, 1, 1, 0,
				0, 0, 0, 0,
			],
			borderM: [
				0, 0, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,
			],
		},
	},
};

// =============================================================
// | HACK SCRIPT INJECTS |/////////////////////////////////////|
// =============================================================
// Replaces initial textbox parameters, based on currently active style (or defaults).
// Makes textboxInfo available at the window level
// Recalculates textbox parameters, even values no longer used with hack, for compatability.
var textboxInfoReplace = `var textboxInfo = {
	img : null,
	width : textboxStyler.activeStyle.textboxWidth,
	height : textboxStyler.activeStyle.textPaddingY + textboxStyler.activeStyle.borderHeight - 2 + (2 * textboxStyler.activeStyle.textMinLines),
	top : textboxStyler.activeStyle.textboxMarginY,
	left : textboxStyler.activeStyle.textboxMarginX,
	bottom : textboxStyler.activeStyle.textboxMarginY,
	font_scale : textboxStyler.activeStyle.textScale/4,
	padding_vert : textboxStyler.activeStyle.textPaddingY,
	padding_horz : textboxStyler.activeStyle.textPaddingX,
	arrow_height : textboxStyler.activeStyle.textPaddingY + textboxStyler.activeStyle.borderHeight - 4,
};
window.textboxInfo = textboxInfo;`;
inject(/var textboxInfo = [^]*?};/, textboxInfoReplace);

// Replaces ClearTextbox function to include border-drawing scripts
var clearTextboxReplace = `this.ClearTextbox = function() {
	if(context == null) return;

	//create new image none exists
	if(textboxInfo.img == null)
		textboxInfo.img = context.createImageData(textboxInfo.width*scale, textboxInfo.height*scale);

	// Draw Textbox Background based on BGColor (indices are R,G,B, and A)
	for (var i=0;i<textboxInfo.img.data.length;i+=4)
	{
		textboxInfo.img.data[i+0]=textboxStyler.activeStyle.textboxColor[0];
		textboxInfo.img.data[i+1]=textboxStyler.activeStyle.textboxColor[1];
		textboxInfo.img.data[i+2]=textboxStyler.activeStyle.textboxColor[2];
		textboxInfo.img.data[i+3]=textboxStyler.activeStyle.textboxColor[3];
	}

	textboxStyler.drawBorder();
};`;
inject(/this.ClearTextbox = [^]*?};/, clearTextboxReplace);

// Replaces Draw Textbox function, with function that supports vertical and horizontal shifting
var drawTextboxReplace = `this.DrawTextbox = function() {
	if(context == null) return;

	// Textbox defaults to center-aligned
	var textboxXPosition = ((width/2)-(textboxInfo.width/2))*scale;
	var textboxYPosition = ((height/2)-(textboxInfo.height/2))*scale;

	if (isCentered) {
		context.putImageData(textboxInfo.img, textboxXPosition, textboxYPosition);
	}
	else {
		if (textboxStyler.activeStyle.verticalPosition.toLowerCase() == "shift") {
			if (player().y < mapsize/2) {
				//player on bottom half, so draw on top
				textboxYPosition = ((height-textboxInfo.top-textboxInfo.height)*scale);
			}
			else {
				textboxYPosition = textboxInfo.top*scale;
			}
		}
		else if (textboxStyler.activeStyle.verticalPosition.toLowerCase() == "top") {
			textboxYPosition = textboxInfo.top*scale;
		}
		else if (textboxStyler.activeStyle.verticalPosition.toLowerCase() == "bottom") {
			textboxYPosition = ((height-textboxInfo.top-textboxInfo.height)*scale);
		}

		if (textboxStyler.activeStyle.horizontalPosition.toLowerCase() == "shift") {
			if (player().x < mapsize/2) {
				// player on left half, so draw on right
				textboxXPosition = ((width-textboxInfo.left-textboxInfo.width)*scale);
			}
			else {
				textboxXPosition = textboxInfo.left*scale;
			}
		}
		else if (textboxStyler.activeStyle.horizontalPosition.toLowerCase() == "right") {
			textboxXPosition = ((width-textboxInfo.left-textboxInfo.width)*scale);
		}
		else if (textboxStyler.activeStyle.horizontalPosition.toLowerCase() == "left") {
			textboxXPosition = textboxInfo.left*scale;
		}

		// Draw the Textbox
		context.putImageData(textboxInfo.img, textboxXPosition, textboxYPosition);
	}
};`;
inject(/this.DrawTextbox = [^]*?};/, drawTextboxReplace);

// Replace DrawNextArrow function, to support custom sprites, colors, and arrow repositioning
var drawNextArrowReplace = `this.DrawNextArrow = function() {
	// Arrow sprite is center-bottom by default
	var top = ((4/textboxStyler.activeStyle.arrowScale)*textboxInfo.height - textboxStyler.activeStyle.arrowHeight - textboxStyler.activeStyle.arrowInsetY) *  textboxStyler.activeStyle.arrowScale;
	var left = ((4/textboxStyler.activeStyle.textboxArrowScale)*textboxInfo.width - textboxStyler.activeStyle.arrowXSize) * textboxStyler.activeStyle.textboxArrowScale*0.5;

	// Reposition arrow based on arrowAlign and RTL settings (flipped for RTL Languages)
	if (textboxStyler.activeStyle.arrowAlign.toLowerCase() == "left") {
		if (textDirection === TextDirection.RightToLeft) {
			left = ((4/textboxStyler.activeStyle.arrowScale)*textboxInfo.width - textboxStyler.activeStyle.arrowWidth - textboxStyler.activeStyle.arrowInsetX) *  textboxStyler.activeStyle.arrowScale;
		}
		else {
			left = (textboxStyler.activeStyle.arrowXPadding) * textboxStyler.activeStyle.textboxArrowScale;
		}
	}
	else if (textboxStyler.activeStyle.arrowAlign.toLowerCase() == "right") {
		if (textDirection === TextDirection.RightToLeft) {
			left = (arrowXPadding) * textboxArrowScale;
		}
		else {
			left = ((4/textboxStyler.activeStyle.arrowScale)*textboxInfo.width - textboxStyler.activeStyle.arrowWidth - textboxStyler.activeStyle.arrowInsetX) *  textboxStyler.activeStyle.arrowScale;
		}
	}
	
	// Draw arrow sprite pixels on textbox
	for (var y = 0; y < textboxStyler.activeStyle.arrowHeight; y++) {
		for (var x = 0; x < textboxStyler.activeStyle.arrowWidth; x++) {
			var i = (y * textboxStyler.activeStyle.arrowWidth) + x;

			//scaling hooplah
			for (var sy = 0; sy < textboxStyler.activeStyle.arrowScale; sy++) {
				for (var sx = 0; sx < textboxStyler.activeStyle.arrowScale; sx++) {
					var pxl = 4 * ( ((top+(y*textboxStyler.activeStyle.arrowScale)+sy) * (textboxInfo.width*4)) + (left+(x*textboxStyler.activeStyle.arrowScale)+sx) );
					// Draws arrow's pixels in Arrow Color
					if (textboxStyler.activeStyle.arrowSprite[i] == 1) {
						textboxInfo.img.data[pxl+0] = textboxStyler.activeStyle.arrowColor[0];
						textboxInfo.img.data[pxl+1] = textboxStyler.activeStyle.arrowColor[1];
						textboxInfo.img.data[pxl+2] = textboxStyler.activeStyle.arrowColor[2];
						textboxInfo.img.data[pxl+3] = textboxStyler.activeStyle.arrowColor[3];
					}
					// Draws arrow's bg pixels using Arrow BG Color
					else {
						textboxInfo.img.data[pxl+0] = textboxStyler.activeStyle.arrowBGColor[0];
						textboxInfo.img.data[pxl+1] = textboxStyler.activeStyle.arrowBGColor[1];
						textboxInfo.img.data[pxl+2] = textboxStyler.activeStyle.arrowBGColor[2];
						textboxInfo.img.data[pxl+3] = textboxStyler.activeStyle.arrowBGColor[3];
					}
				}
			}
		}
	}
};`;
inject(/this.DrawNextArrow = [^]*?};/, drawNextArrowReplace);

// Inject to support custom text scaling
inject(/var text_scale = .+?;/, 'var text_scale = textboxStyler.activeStyle.textScale;');

// Injects to support text padding within the textbox
var topTextPaddingReplace = 'var top = (2 * textboxStyler.activeStyle.textPaddingY) + (textboxStyler.activeStyle.borderHeight * 2) + (row * 2 * scale) + (row * font.getHeight() * textboxStyler.activeStyle.textScale) + Math.floor( char.offset.y );';
var leftTextPaddingReplace = 'var left = (2* textboxStyler.activeStyle.textPaddingX) + (textboxStyler.activeStyle.borderWidth * 2) + (leftPos * textboxStyler.activeStyle.textScale) + Math.floor( char.offset.x );';
inject(/var top = \(4 \* scale\) \+ \(row \* 2 \* scale\) .+?\);/, topTextPaddingReplace);
inject(/var left = \(4 \* scale\) \+ \(leftPos \* text_scale\) .+?\);/, leftTextPaddingReplace);

// Inject to support custom text speeds
inject(/var nextCharMaxTime = .+?;/, 'var nextCharMaxTime = textboxStyler.activeStyle.textSpeed;');

// Inject to support custom default text color
inject(/this.color = .+?};/, 'this.color = { r:textboxStyler.activeStyle.textColor[0], g:textboxStyler.activeStyle.textColor[1], b:textboxStyler.activeStyle.textColor[2], a:textboxStyler.activeStyle.textColor[3] };');

// Inject to support dynamic textbox resizing. Attach to window to make it accessible from hack.
inject(/var pixelsPerRow = .+?;/, 'window.pixelsPerRow = (textboxStyler.activeStyle.textboxWidth*(4/textboxStyler.activeStyle.textScale)) - (textboxStyler.activeStyle.borderWidth*(4/textboxStyler.activeStyle.textScale)) - (textboxStyler.activeStyle.textPaddingX*(4/textboxStyler.activeStyle.textScale));');
// var pixelsPerRow = (textboxWidth*2) - (borderWidth*2) - (textPaddingX*2); // hard-coded fun times!!! 192

// Store font height at parent level when calculated.
var fontSizeInject = `else if (args[0] == "SIZE") {
	width = parseInt(args[1]);
	height = parseInt(args[2]);
	window.fontHeight = height;
	console.log(fontHeight);
}`;
inject(/else if \(args\[0\] == "SIZE"\) {[^]*?}/, fontSizeInject);
console.log(fontSizeInject);
// =============================================================
// | RE-IMPLIMENTED LONG DIALOG HACK INJECTS |/////////////////|
// =============================================================
// Modified from Sean leBlanc's Long Dialog hack, to include textbox borders and padding
// Needed to recalculate textbox height, based on current style parameters.
// Added textMinLines and textMaxLines to hackOptions parameters, to include in style swapping

// override textbox height (and recalculate textboxWidth)
inject(/textboxInfo\.height = .+;/, `Object.defineProperty(textboxInfo, 'height', {
	get() { return textboxStyler.activeStyle.textPaddingY + textboxStyler.activeStyle.borderHeight - 2 + ((2 + relativeFontHeight()) * Math.max(textboxStyler.activeStyle.textMinLines, dialogBuffer.CurPage().indexOf(dialogBuffer.CurRow())+Math.sign(dialogBuffer.CurCharCount()))); }
})`);

// prevent textbox from caching
inject(/(if\(textboxInfo\.img == null\))/, '// $1');

// rewrite hard-coded row limit
inject(/(else if \(curRowIndex )== 0/g, '$1 < textboxStyler.activeStyle.textMaxLines - 1');
inject(/(if\( lastPage\.length) <= 1( \) {)/, '$1 < textboxStyler.activeStyle.textMaxLines $2');

// =============================================================
// | HACK FUNCTIONS |//////////////////////////////////////////|
// =============================================================

// Make them accessible at a higher scope, so Dialog functions can see them.
window.textboxStyler = {
	defaultStyle: {
		verticalPosition: hackOptions.verticalPosition,
		horizontalPosition: hackOptions.horizontalPosition,
		textboxColor: hackOptions.textboxColor,
		textboxWidth: hackOptions.textboxWidth,
		textboxMarginX: hackOptions.textboxMarginX,
		textboxMarginY: hackOptions.textboxMarginY,
		textColor: hackOptions.textColor,
		textMinLines: hackOptions.textMinLines,
		textMaxLines: hackOptions.textMaxLines,
		textScale: hackOptions.textScale,
		textSpeed: hackOptions.textSpeed,
		textPaddingX: hackOptions.textPaddingX,
		textPaddingY: hackOptions.textPaddingY,
		borderColor: hackOptions.borderColor,
		borderBGColor: hackOptions.borderBGColor,
		borderMidColor: hackOptions.borderMidColor,
		borderWidth: hackOptions.borderWidth,
		borderHeight: hackOptions.borderHeight,
		borderScale: hackOptions.borderScale,
		arrowColor: hackOptions.arrowColor,
		arrowBGColor: hackOptions.arrowBGColor,
		arrowScale: hackOptions.arrowScale,
		arrowAlign: hackOptions.arrowAlign,
		arrowInsetX: hackOptions.arrowInsetX,
		arrowInsetY: hackOptions.arrowInsetY,
		arrowWidth: hackOptions.arrowWidth,
		arrowHeight: hackOptions.arrowHeight,
		arrowSprite: hackOptions.arrowSprite,
		borderUL: hackOptions.borderUL,
		borderU: hackOptions.borderU,
		borderUR: hackOptions.borderUR,
		borderL: hackOptions.borderL,
		borderR: hackOptions.borderR,
		borderDL: hackOptions.borderDL,
		borderD: hackOptions.borderD,
		borderDR: hackOptions.borderDR,
		borderM: hackOptions.borderM,
	},

	activeStyle: {
		verticalPosition: hackOptions.verticalPosition,
		horizontalPosition: hackOptions.horizontalPosition,
		textboxColor: hackOptions.textboxColor,
		textboxWidth: hackOptions.textboxWidth,
		textboxMarginX: hackOptions.textboxMarginX,
		textboxMarginY: hackOptions.textboxMarginY,
		textColor: hackOptions.textColor,
		textMinLines: hackOptions.textMinLines,
		textMaxLines: hackOptions.textMaxLines,
		textScale: hackOptions.textScale,
		textSpeed: hackOptions.textSpeed,
		textPaddingX: hackOptions.textPaddingX,
		textPaddingY: hackOptions.textPaddingY,
		borderColor: hackOptions.borderColor,
		borderBGColor: hackOptions.borderBGColor,
		borderMidColor: hackOptions.borderMidColor,
		borderWidth: hackOptions.borderWidth,
		borderHeight: hackOptions.borderHeight,
		borderScale: hackOptions.borderScale,
		arrowColor: hackOptions.arrowColor,
		arrowBGColor: hackOptions.arrowBGColor,
		arrowScale: hackOptions.arrowScale,
		arrowAlign: hackOptions.arrowAlign,
		arrowInsetX: hackOptions.arrowInsetX,
		arrowInsetY: hackOptions.arrowInsetY,
		arrowWidth: hackOptions.arrowWidth,
		arrowHeight: hackOptions.arrowHeight,
		arrowSprite: hackOptions.arrowSprite,
		borderUL: hackOptions.borderUL,
		borderU: hackOptions.borderU,
		borderUR: hackOptions.borderUR,
		borderL: hackOptions.borderL,
		borderR: hackOptions.borderR,
		borderDL: hackOptions.borderDL,
		borderD: hackOptions.borderD,
		borderDR: hackOptions.borderDR,
		borderM: hackOptions.borderM,
	},

	styles: hackOptions.dialogStyles,

	// Sets activeStyle elements to the new style if defined, or to defaultStyle's elements if not.
	style: function (newStyle) {
		console.log('SETTING TEXTBOX STYLE TO: ' + newStyle);
		// If newStyle doesn't exist, resets to default
		if (newStyle == undefined || textboxStyler.styles[newStyle] == undefined) {
			textboxStyler.resetStyle();
			console.log('UNDEFINED STYLE. RESETTING TO DEFAULT.');
			return false;
		}
		textboxStyler.activeStyle = Object.assign({}, textboxStyler.defaultStyle, textboxStyler.styles[newStyle]);
		/*
		Object.keys(textboxStyler.activeStyle).forEach(function(prop) {
			if (textboxStyler.styles[newStyle].hasOwnProperty(prop)) {
				textboxStyler.activeStyle[prop] = textboxStyler.styles[newStyle][prop];
			}
			else {
				textboxStyler.activeStyle[prop] = textboxStyler.defaultStyle[prop];
			}
		});
		*/
		textboxStyler.updateTextbox(); // Updates values used for rendering text.
	},
	// Applies defined style parameters to the existing style, without changing anything else.
	setStyle: function (newStyle) {
		console.log('APPLYING STYLE ' + newStyle + ' TO EXISTING TEXTBOX STYLE');
		// If newStyle doesn't exist, does nothing.
		if (textboxStyler.styles[newStyle] == undefined) {
			console.log('UNDEFINED STYLE.');
			return false;
		}
		textboxStyler.activeStyle = Object.assign({}, textboxStyler.activeStyle, textboxStyler.styles[newStyle]);
		/*
		Object.keys(textboxStyler.activeStyle).forEach(function(prop) {
			if (textboxStyler.styles[newStyle].hasOwnProperty(prop))
			{
				textboxStyler.activeStyle[prop] = textboxStyler.styles[newStyle][prop];
			}
		});
		*/
		textboxStyler.updateTextbox();
	},
	// Manually sets a specific property of the active style.
	setProperty: function (property, value) {
		value = 'default';
		console.log('APPLYING STYLE PROPERTY: ' + property + ', ' + value);
		if (textboxStyler.activeStyle.hasOwnProperty(property)) {
			if (value == undefined || value == 'default') {
				console.log('UNDEFINED PROPERTY. SETTING TO DEFAULT.');
				// textboxStyle.activeStyle[property] = textboxStyle.defaultStyle[property];
				textboxStyler.activeStyle[property] = Object.assign({}, textboxStyler.defaultStyle)[property];
			} else {
				textboxStyler.activeStyle[property] = value;
			}
		}

		textboxStyler.updateTextbox();
	},
	// Resets Active Textbox Style to Default Style
	resetStyle: function () {
		console.log('RESETTING TO DEFAULT TEXTBOX STYLE');
		// textboxStyler.activeStyle = textboxStyler.defaultStyle;
		textboxStyler.activeStyle = Object.assign({}, textboxStyler.defaultStyle);

		textboxStyler.updateTextbox();
	},
	// Resets a Textbox Style Property to it's Default value
	resetProperty: function (property) {
		console.log('RESETTING STYLE PROPERTY TO DEFAULT: ' + property);
		if (textboxStyler.activeStyle.hasOwnProperty(property)) {
			// textboxStyle.activeStyle[property] = textboxStyle.defaultStyle[property]; //Don't do it like this. Clone object instead of passing ref.
			textboxStyler.activeStyle[property] = Object.assign({}, textboxStyler.defaultStyle)[property];
		} else {
			console.log('UNDEFINED PROPERTY.');
			return false;
		}

		textboxStyler.updateTextbox();
	},
	// A command to set or adjust the absolute position, width, and lines of a textbox.
	textboxPosition: function (x, y, boxWidth, boxMinLines, boxMaxLines) {
		var curX = textboxStyler.activeStyle.textboxMarginX;
		var curY = textboxStyler.activeStyle.textboxMarginY;
		var curWidth = textboxStyler.activeStyle.textboxWidth;
		var curMinLines = textboxStyler.activeStyle.textboxMinLines;
		var curMaxLines = textboxStyler.activeStyle.textboxMaxLines;

		// X Position
		if (x == undefined) {
			x = curX;
		} else {
			x = x.toString().trim();
			if (x == '') { x = curX; } else if (x.includes('+')) { x = curX + parseInt(x.substring(1)); } else if (x.includes('-')) { x = curX - parseInt(x.substring(1)); }
		}
		if (x < -128 || x > 128) {
			console.log('CLAMPING X POSITION. XPOS (' + x + ') OUT OF BOUNDS. 0-128 EXPECTED.');
			x = Math.max(0, Math.min(x, 128));
		}
		// Y Position
		if (y == undefined) {
			y = curY;
		} else {
			y = y.toString().trim();
			if (y == '') { y = curY; } else if (y.includes('+')) { y = curY + parseInt(y.substring(1)); } else if (y.includes('-')) { y = curY - parseInt(y.substring(1)); }
		}
		if (y < -128 || y > 128) {
			console.log('CLAMPING Y POSITION. YPOS (' + y + ') OUT OF BOUNDS. 0-128 EXPECTED.');
			y = Math.max(0, Math.min(y, 128));
		}
		// Width
		if (boxWidth == undefined) {
			boxWidth = curWidth;
		} else {
			boxWidth = boxWidth.toString().trim();
			if (boxWidth == '') { boxWidth = curWidth; } else if (boxWidth.includes('+')) { boxWidth = curWidth + parseInt(boxWidth.substring(1)); } else if (boxWidth.includes('-')) { boxWidth = curWidth - parseInt(boxWidth.substring(1)); }
		}
		if (boxWidth < 0 || boxWidth > 128) {
			console.log('CLAMPING WIDTH (' + (boxWidth) + '). 0-128 EXPECTED.');
			boxWidth = Math.max(0, Math.min(boxWidth, 128));
		}
		// Minimum Lines
		if (boxMinLines == undefined) {
			boxMinLines = curMinLines;
		} else {
			boxMinLines = boxMinLines.toString().trim();
			if (boxMinLines == '') { boxMinLines = curMinLines; } else if (boxMinLines.includes('+')) { boxMinLines = curMinLines + parseInt(boxMinLines.substring(1)); } else if (boxMinLines.includes('-')) { boxMinLines = curMinLines - parseInt(boxMinLines.substring(1)); }
		}
		if (boxMinLines < 0 || boxMinLines > 128) {
			console.log('CLAMPING TEXT MIN LINES (' + (boxMinLines) + '). 0-128 EXPECTED.');
			boxMinLines = Math.max(0, Math.min(boxMinLines, 128));
		}
		// Maximum Lines
		if (boxMaxLines == undefined) {
			boxMaxLines = curMaxLines;
		} else {
			boxMaxLines = boxMaxLines.toString().trim();
			if (boxMaxLines == '') { boxMaxLines = boxMaxLines; } else if (boxMaxLines.includes('+')) { boxMaxLines += parseInt(boxMaxLines.substring(1)); } else if (boxMaxLines.includes('-')) { boxMaxLines -= parseInt(boxMaxLines.substring(1)); }
		}
		if (boxMaxLines < 0 || boxMaxLines > 128) {
			console.log('CLAMPING TEXT MAX LINES (' + (boxMaxLines) + '). 0-128 EXPECTED.');
			boxMaxLines = Math.max(0, Math.min(boxMaxLines, 128));
		}

		textboxStyler.activeStyle.textboxWidth = boxWidth;
		textboxStyler.activeStyle.textboxMinLines = boxMinLines;
		textboxStyler.activeStyle.textboxMaxLines = boxMaxLines;
		textboxStyler.activeStyle.textboxMarginY = y;
		textboxStyler.activeStyle.textboxMarginX = x;
		textboxStyler.activeStyle.verticalPosition = 'top';
		textboxStyler.activeStyle.horizontalPosition = 'left';

		textboxStyler.updateTextbox();
	},

	// First draft of position. Kept here for future versions.
	textboxCornersWIP: function (x1, y1, x2, y2) {
		// Trim and sanitize X and Y Positions, and set to current position if omitted.
		var curX1 = textboxStyler.activeStyle.textboxMarginX;
		var curX2 = curX1 + textboxStyler.activeStyle.textboxWidth;
		var curY1 = textboxStyler.activeStyle.textboxMarginY;
		var curY2 = curY1 + (textboxStyler.activeStyle.textPaddingY + textboxStyler.activeStyle.borderHeight - 2 + (2 * textboxStyler.activeStyle.textMinLines));

		if (x1 == undefined) {
			x1 = curX1;
		} else {
			x1 = x1.toString().trim();
			if (x1 == '') { x1 = curX1; } else if (x1.includes('+')) { x1 = curX1 + parseInt(x1.substring(1)); } else if (x1.includes('-')) { x1 = curX1 - parseInt(x1.substring(1)); }
		}
		if (x1 < 0 || x1 > 128) {
			console.log('CLAMPING X1 POSITION. XPOS (' + x1 + ') OUT OF BOUNDS. 0-128 EXPECTED.');
			x1 = Math.max(0, Math.min(x1, 128));
		}
		// X2
		if (x2 == undefined) {
			x2 = curX2;
		} else {
			x2 = x2.toString().trim();
			if (x2 == '') { x2 = curX2; } else if (x2.includes('+')) { x2 = curX2 + parseInt(x2.substring(1)); } else if (x2.includes('-')) { x2 = curX2 - parseInt(x2.substring(1)); }
		}
		if (x2 < 0 || x2 > 128) {
			console.log('CLAMPING X2 POSITION. xPos (' + x2 + ') OUT OF BOUNDS. 0-128 EXPECTED.');
			x2 = Math.max(0, Math.min(x2, 128));
		}
		// Y1
		if (y1 == undefined) {
			y1 = curY1;
		} else {
			y1 = y1.toString().trim();
			if (y1 == '') { y1 = curY1; } else if (y1.includes('+')) { y1 = curY1 + parseInt(y1.substring(1)); } else if (y1.includes('-')) { y1 = curY1 - parseInt(y1.substring(1)); }
		}
		if (y1 < 0 || y1 > 128) {
			console.log('CLAMPING Y1 POSITION. XPOS (' + y1 + ') OUT OF BOUNDS. 0-128 EXPECTED.');
			y1 = Math.max(0, Math.min(y1, 128));
		}
		// Y2
		if (y2 == undefined) {
			y2 = curY2;
		} else {
			y2 = y2.toString().trim();
			if (y2 == '') { y2 = curY2; } else if (y2.includes('+')) { y2 = curY2 + parseInt(y2.substring(1)); } else if (y2.includes('-')) { y2 = curY2 - parseInt(y2.substring(1)); }
		}
		if (y2 < 0 || y2 > 128) {
			console.log('CLAMPING Y2 POSITION. xPos (' + y2 + ') OUT OF BOUNDS. 0-128 EXPECTED.');
			y2 = Math.max(0, Math.min(y2, 128));
		}

		console.log('SETTING TEXTBOX CORNERS TO (' + x1 + ',' + y1 + ') and (' + x2 + ',' + y2 + ')');
		var topPos = Math.min(y1, y2);
		var leftPos = Math.min(x1, x2);
		var bottomPos = Math.max(y1, y2);
		var rightPos = Math.max(x1, x2);
		var width = rightPos - leftPos;
		var height = bottomPos - topPos;
		var lineCount = Math.floor(height / 8);

		textboxStyler.activeStyle.textboxWidth = width;
		textboxStyler.activeStyle.textMinLines = Math.max(1, lineCount);
		textboxStyler.activeStyle.textMaxLines = Math.max(1, lineCount);
		textboxStyler.activeStyle.textPaddingY = (height - (textboxStyler.activeStyle.textMinLines * 8)) / 2;
		textboxStyler.activeStyle.textboxMarginY = topPos;
		textboxStyler.activeStyle.textboxMarginX = leftPos;
		textboxStyler.activeStyle.verticalPosition = 'top';
		textboxStyler.activeStyle.horizontalPosition = 'left';

		textboxStyler.updateTextbox();
	},
	// Updates parameters of the textbox based on style settings.
	// TODO: see if you can re-render existing textbox content in new style?
	updateTextbox: function () {
		textboxInfo.width = textboxStyler.activeStyle.textboxWidth;
		// textboxInfo.height = textboxStyler.activeStyle.textPaddingY + textboxStyler.activeStyle.borderHeight - 2 + (2 * textboxStyler.activeStyle.textMinLines);
		textboxInfo.top = textboxStyler.activeStyle.textboxMarginY;
		textboxInfo.left = textboxStyler.activeStyle.textboxMarginX;
		textboxInfo.bottom = textboxStyler.activeStyle.textboxMarginY;
		textboxInfo.font_scale = textboxStyler.activeStyle.textScale / 4;
		textboxInfo.padding_vert = textboxStyler.activeStyle.textPaddingY;
		textboxInfo.padding_horz = textboxStyler.activeStyle.textPaddingX;
		textboxInfo.arrow_height = textboxStyler.activeStyle.textPaddingY + textboxStyler.activeStyle.borderHeight - 4;

		pixelsPerRow = (textboxStyler.activeStyle.textboxWidth * 2) - (textboxStyler.activeStyle.borderWidth * 2) - (textboxStyler.activeStyle.textPaddingX * 2);

		textboxInfo.img = ctx.createImageData(textboxInfo.width * scale, textboxInfo.height * scale);
	},
	// Draw border to the background of the textbox image, before rendering text or arrows.
	drawBorder: function () {
		// console.log ("DRAWING TEXTBOX BORDER");
		// Iterates through each pixel of the textbox, and determines if a border pixel should be drawn.
		// Compares 1D array of textbox pixels to 1D arrays for each border sprite, to determine whether to draw a pixel.
		for (var y = 0; y < (4 / textboxStyler.activeStyle.borderScale) * textboxInfo.height; y++) {
			for (var x = 0; x < (4 / textboxStyler.activeStyle.borderScale) * textboxInfo.width; x++) {
				// NOTE: borderXId and borderYId translate message box coordinates to border tile coordinates.
				// Use modulo to translate textbox space into tiles, for drawing borders pixel-by-pixel.
				// For bottom/right borders, border sprites should be anchored to the bottom/right instead.
				// borderYId and borderXId get pixel coordinates anchored to the top or left
				// borderDId and borderRId get pixel coordinates anchored to down or right (for right/bottom edges)
				var borderYId = (y % textboxStyler.activeStyle.borderHeight);
				var borderXId = (x % textboxStyler.activeStyle.borderWidth);
				var borderDId = ((y + ((4 / textboxStyler.activeStyle.borderScale) * textboxInfo.height)) % textboxStyler.activeStyle.borderHeight);
				var borderRId = ((x + ((4 / textboxStyler.activeStyle.borderScale) * textboxInfo.width)) % textboxStyler.activeStyle.borderWidth);

				// NOTE: There's a weird bug with odd vs even textbox heights. Here's a hacky fix for now.
				// TODO: Handle decimal heights? Still bugs with those (may come up with bitsy's text scaling)
				if (textboxInfo.height % textboxStyler.activeStyle.borderScale != 0) {
					borderDId = ((y - 4 + ((4 / textboxStyler.activeStyle.borderScale) * textboxInfo.height)) % textboxStyler.activeStyle.borderHeight);
				}

				// Calculates index in the 1D array of the border sprite.
				var borderPxl = (borderYId * textboxStyler.activeStyle.borderWidth) + borderXId;
				var bottomPxl = (borderDId * textboxStyler.activeStyle.borderWidth) + borderXId;
				var rightPxl = (borderYId * textboxStyler.activeStyle.borderWidth) + borderRId;
				var bottomRightPxl = (borderDId * textboxStyler.activeStyle.borderWidth) + borderRId;

				// Determines if the current pixel is along one of the textbox's edges, or if it's in the center.
				var borderTop = y < textboxStyler.activeStyle.borderHeight;
				var borderBottom = y >= textboxInfo.height * (4 / textboxStyler.activeStyle.borderScale) - textboxStyler.activeStyle.borderHeight;
				var borderLeft = x < textboxStyler.activeStyle.borderWidth;
				var borderRight = x >= textboxInfo.width * (4 / textboxStyler.activeStyle.borderScale) - textboxStyler.activeStyle.borderWidth;

				// Does this pixel is draw???
				// 1= draw a border pixel, 0= No! Draw a border bg pixel instead
				var borderDraw;

				// Retrieve pixel data from appropriate sprite. Special handling for bottom/right borders!
				if (borderBottom) {
					// Bottom Left Corner
					if (borderLeft) { borderDraw = textboxStyler.activeStyle.borderDL[bottomPxl]; }
					// Bottom Right Corner
					else if (borderRight) { borderDraw = textboxStyler.activeStyle.borderDR[bottomRightPxl]; }
					// Bottom Middle Edge
					else { borderDraw = textboxStyler.activeStyle.borderD[bottomPxl]; }
				} else if (borderTop) {
					// Top Left Corner
					if (borderLeft) { borderDraw = textboxStyler.activeStyle.borderUL[borderPxl]; }
					// Top Right Corner
					else if (borderRight) { borderDraw = textboxStyler.activeStyle.borderUR[rightPxl]; }
					// Top Middle Edge
					else { borderDraw = textboxStyler.activeStyle.borderU[borderPxl]; }
				}
				// Left Edge
				else if (borderLeft) { borderDraw = textboxStyler.activeStyle.borderL[borderPxl]; }
				// Right Edge
				else if (borderRight) { borderDraw = textboxStyler.activeStyle.borderR[rightPxl]; }
				// Middle
				else { borderDraw = textboxStyler.activeStyle.borderM[borderPxl]; }

				// scaling shenanigans (maps sprite scale pixels to bitsy/screen-scale pixels)
				for (var sy = 0; sy < textboxStyler.activeStyle.borderScale; sy++) {
					for (var sx = 0; sx < textboxStyler.activeStyle.borderScale; sx++) {
						var pxl = 4 * ((((textboxStyler.activeStyle.borderScale * y) + sy) * (4 * textboxInfo.width)) + (textboxStyler.activeStyle.borderScale * x) + sx);

						// If it's a border pixel, Retrieves RGBA values for the border, and draws it.
						if (borderDraw) {
							if (borderTop || borderBottom || borderLeft || borderRight) {
								textboxInfo.img.data[pxl + 0] = textboxStyler.activeStyle.borderColor[0];
								textboxInfo.img.data[pxl + 1] = textboxStyler.activeStyle.borderColor[1];
								textboxInfo.img.data[pxl + 2] = textboxStyler.activeStyle.borderColor[2];
								textboxInfo.img.data[pxl + 3] = textboxStyler.activeStyle.borderColor[3];
							} else {
								textboxInfo.img.data[pxl + 0] = textboxStyler.activeStyle.borderMidColor[0];
								textboxInfo.img.data[pxl + 1] = textboxStyler.activeStyle.borderMidColor[1];
								textboxInfo.img.data[pxl + 2] = textboxStyler.activeStyle.borderMidColor[2];
								textboxInfo.img.data[pxl + 3] = textboxStyler.activeStyle.borderMidColor[3];
							}
							// DEBUG COLORS. UNCOMMENT TO DRAW PIXELS BASED ON TEXTBOX COORDINATES, 0-255
							/* textboxInfo.img.data[pxl+0] = 204-(x);
							textboxInfo.img.data[pxl+1] = 204-(x+y);
							textboxInfo.img.data[pxl+2] = 204-(y*2);
							textboxInfo.img.data[pxl+3] = 255;
							//DRAWS TOP-LEFT-ANCHORED GRID TILE COORDINATES IN GREY
							if (y % borderHeight == 0 || x % borderWidth == 0) {
								textboxInfo.img.data[pxl+0] = 128;
								textboxInfo.img.data[pxl+1] = 128;
								textboxInfo.img.data[pxl+2] = 128;
								textboxInfo.img.data[pxl+3] = 255;
							} */
						}
						// If it's a border BG pixel, gets RGBA colors based on if it's on an edge or in middle.
						else {
							if (borderTop || borderBottom || borderLeft || borderRight) {
								textboxInfo.img.data[pxl + 0] = textboxStyler.activeStyle.borderBGColor[0];
								textboxInfo.img.data[pxl + 1] = textboxStyler.activeStyle.borderBGColor[1];
								textboxInfo.img.data[pxl + 2] = textboxStyler.activeStyle.borderBGColor[2];
								textboxInfo.img.data[pxl + 3] = textboxStyler.activeStyle.borderBGColor[3];
							} else {
								textboxInfo.img.data[pxl + 0] = textboxStyler.activeStyle.textboxColor[0];
								textboxInfo.img.data[pxl + 1] = textboxStyler.activeStyle.textboxColor[1];
								textboxInfo.img.data[pxl + 2] = textboxStyler.activeStyle.textboxColor[2];
								textboxInfo.img.data[pxl + 3] = textboxStyler.activeStyle.textboxColor[3];
							}
							// DEBUG COLORS. UNCOMMENT TO DRAW PIXELS BASED ON TEXTBOX COORDINATES, 0-255
							/* textboxInfo.img.data[pxl+0] = (x)+102;
							textboxInfo.img.data[pxl+1] = (x+y);
							textboxInfo.img.data[pxl+2] = (y*2)+51;
							textboxInfo.img.data[pxl+3] = 255;
							//DRAWS TOP-LEFT-ANCHORED GRID COORDINATES IN GREY
							if (y % borderHeight == 0 || x % borderWidth == 0) {
								textboxInfo.img.data[pxl+0] = 76;
								textboxInfo.img.data[pxl+1] = 76;
								textboxInfo.img.data[pxl+2] = 76;
								textboxInfo.img.data[pxl+3] = 255;
							} */
						}
					}
				}
			}
		}
	},
};

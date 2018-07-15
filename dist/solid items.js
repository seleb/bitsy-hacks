/**
🛑
@file solid items
@summary treat some items like sprites that can be placed multiple times
@license MIT
@version 1.0.1
@author Sean S. LeBlanc

@description
Prevents certain items from being picked up or walked over, but still triggers their dialog.
This allows them to be treated like sprites that can be placed multiple times.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `itemIsSolid` function below to match your needs
*/
(function (bitsy) {
'use strict';
var hackOptions = {
	itemIsSolid: function (item) {
		//return item.name == 'tea'; // specific solid item
		//return ['tea', 'flower', 'hat'].indexOf(item.name) !== -1; // specific solid item list
		//return item.name.indexOf('SOLID') !== -1; // solid item flag in name
		return true; // all items are solid
	}
};

bitsy = bitsy && bitsy.hasOwnProperty('default') ? bitsy['default'] : bitsy;





// true if item should be treated as sprite
// false if item should be treated normally
function getSolidItemFromIndex(itemIndex) {
	if (itemIndex === -1) {
		return;
	}
	var itemId = bitsy.room[bitsy.curRoom].items[itemIndex].id;
	var item = bitsy.item[itemId];
	if (hackOptions.itemIsSolid(item)) {
		return item;
	}
	return;
}

var _getItemIndex = bitsy.getItemIndex;
bitsy.getItemIndex = function () {
	var itemIndex = _getItemIndex.apply(this, arguments);
	var sprItem = getSolidItemFromIndex(itemIndex);
	if (sprItem) {
		return -1;
	}
	return itemIndex;
};

var _getSpriteAt = bitsy.getSpriteAt;
bitsy.getSpriteAt = function (x, y) {
	var spr = _getSpriteAt.apply(this, arguments);
	if (spr) {
		return spr;
	}
	var itemIndex = _getItemIndex(bitsy.curRoom, x, y);
	var item = getSolidItemFromIndex(itemIndex);
	if (item) {
		return item.drw;
	}
};

var _startSpriteDialog = bitsy.startSpriteDialog;
bitsy.startSpriteDialog = function (spriteId) {
	var item = spriteId.split("ITM_")[1];
	if (item) {
		return bitsy.startItemDialog(item);
	}
	_startSpriteDialog.apply(this, arguments);
};

}(window));

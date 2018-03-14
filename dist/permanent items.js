/**
⏳
@file permanent items
@summary prevent some items from being picked up
@license MIT
@version 1.0.0
@author Sean S. LeBlanc

@description
Prevents certain items from being picked up, but allows them to be walked over and triggers their dialog.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `itemIsPermanent` function below to match your needs
*/
(function (bitsy) {
'use strict';
var hackOptions = {
	itemIsPermanent: function (item) {
		//return item.name == 'tea'; // specific permanent item
		//return ['tea', 'flower', 'hat'].indexOf(item.name) !== -1; // specific permanent item list
		//return item.name.indexOf('PERMANENT') !== -1; // permanent item flag in name
		return true; // all items are permanent
	}
};

bitsy = bitsy && bitsy.hasOwnProperty('default') ? bitsy['default'] : bitsy;





var _onInventoryChanged = bitsy.onInventoryChanged;
bitsy.onInventoryChanged = function(itemId) {
	if(_onInventoryChanged){
		_onInventoryChanged.apply(this, arguments);
	}
	// if a permanent item is picked up, immediately add another instance
	// to replace the one that was just picked up
	if(hackOptions.itemIsPermanent(bitsy.item[itemId])){
		bitsy.room[bitsy.curRoom].items.push({
			id: itemId,
			x: bitsy.player().x,
			y: bitsy.player().y
		});
	}
};

}(window));

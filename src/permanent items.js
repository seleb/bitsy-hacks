/**
⏳
@file permanent items
@summary prevent some items from being picked up
@license MIT
@version 2.1.4
@author Sean S. LeBlanc

@description
Prevents certain items from being picked up, but allows them to be walked over and triggers their dialog.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `itemIsPermanent` function below to match your needs
*/
import bitsy from "bitsy";
import {
	before,
	after
} from "./helpers/kitsy-script-toolkit";

export var hackOptions = {
	itemIsPermanent: function (item) {
		//return item.name && item.name == 'tea'; // specific permanent item
		//return ['tea', 'flower', 'hat'].indexOf(item.name) !== -1; // specific permanent item list
		//return item.name && item.name.indexOf('PERMANENT') !== -1; // permanent item flag in name
		return true; // all items are permanent
	}
};

var room;
var oldItems;
before("movePlayer", function () {
	room = bitsy.room[bitsy.curRoom];
	oldItems = room.items.slice();
});
after("movePlayer", function () {
	var newItems = room.items;
	if (newItems.length === oldItems.length) {
		return; // nothing changed
	}

	// check for changes
	for (var i = 0; i < oldItems.length; ++i) {
		if (!newItems[i] ||
			oldItems[i].x !== newItems[i].x ||
			oldItems[i].y !== newItems[i].y ||
			oldItems[i].id !== newItems[i].id
		) {
			// something changed
			if (hackOptions.itemIsPermanent(bitsy.item[oldItems[i].id])) {
				// put that back!
				newItems.splice(i, 0, oldItems[i]);
			} else {
				// add an empty entry for now to keep the arrays aligned
				newItems.splice(i, 0, null);
			}
		}
	}
	// clear out those empty entries
	room.items = newItems.filter(function (item) {
		return !!item;
	});
});

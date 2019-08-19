/**
❄
@file unique items
@summary items which, when picked up, remove all other instances of that item from the game
@license MIT
@version 2.0.3
@author Sean S. LeBlanc

@description
Adds support for items which, when picked up,
remove all other instances of that item from the game.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `itemIsUnique` function to match your needs
*/
import bitsy from "bitsy";
import {
	after
} from "./helpers/kitsy-script-toolkit";

export var hackOptions = {
	itemIsUnique: function (item) {
		//return item.name == 'tea'; // specific unique item
		//return ['tea', 'flower', 'hat'].indexOf(item.name) !== -1; // specific unique item list
		//return item.name.indexOf('UNIQUE') !== -1; // unique item flag in name
		return true; // all items are unique
	}
};

after('onInventoryChanged', function (id) {
	var r;
	if (hackOptions.itemIsUnique(bitsy.item[id])) {
		for (r in bitsy.room) {
			if (Object.prototype.hasOwnProperty.call(bitsy.room, r)) {
				r = bitsy.room[r];
				r.items = r.items.filter(function (i) {
					return i.id !== id;
				});
			}
		}
	}
});

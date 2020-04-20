/**
❄
@file unique items
@summary items which, when picked up, remove all other instances of that item from the game
@license MIT
@version 2.0.7
@author Sean S. LeBlanc

@description
Adds support for items which, when picked up,
remove all other instances of that item from the game.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `itemIsUnique` function to match your needs
*/
import bitsy from 'bitsy';
import {
	after,
} from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	itemIsUnique: function (item) {
		// return item.name && item.name == 'tea'; // specific unique item
		// return ['tea', 'flower', 'hat'].indexOf(item.name) !== -1; // specific unique item list
		// return item.name && item.name.indexOf('UNIQUE') !== -1; // unique item flag in name
		return true; // all items are unique
	},
};

after('onInventoryChanged', function (id) {
	if (hackOptions.itemIsUnique(bitsy.item[id])) {
		Object.values(bitsy.room).forEach(function (room) {
			room.items = room.items.filter(function (i) {
				return i.id !== id;
			});
		});
	}
});

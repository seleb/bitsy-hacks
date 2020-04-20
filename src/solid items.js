/**
🛑
@file solid items
@summary treat some items like sprites that can be placed multiple times
@license MIT
@version 2.1.6
@author Sean S. LeBlanc

@description
Prevents certain items from being picked up or walked over, but still triggers their dialog.
This allows them to be treated like sprites that can be placed multiple times.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `itemIsSolid` function below to match your needs
*/
import bitsy from 'bitsy';
import {
	before,
	after,
} from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	itemIsSolid: function (item) {
		// return item.name && item.name == 'tea'; // specific solid item
		// return ['tea', 'flower', 'hat'].indexOf(item.name) !== -1; // specific solid item list
		// return item.name && item.name.indexOf('SOLID') !== -1; // solid item flag in name
		return true; // all items are solid
	},
};

var room;
var oldItems;
var x;
var y;
before('movePlayer', function () {
	x = bitsy.player().x;
	y = bitsy.player().y;
	room = bitsy.room[bitsy.curRoom];
	oldItems = room.items.slice();
});
after('movePlayer', function () {
	var newItems = room.items;
	if (newItems.length === oldItems.length) {
		return; // nothing changed
	}

	// check for changes
	for (var i = 0; i < oldItems.length; ++i) {
		if (!newItems[i]
			|| oldItems[i].x !== newItems[i].x
			|| oldItems[i].y !== newItems[i].y
			|| oldItems[i].id !== newItems[i].id
		) {
			// something changed
			if (hackOptions.itemIsSolid(bitsy.item[oldItems[i].id])) {
				// put that back!
				newItems.splice(i, 0, oldItems[i]);
				// get back there!
				bitsy.player().x = x;
				bitsy.player().y = y;
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

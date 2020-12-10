/**
❄
@file unique items
@summary items which, when picked up, remove all other instances of that item from the game
@license MIT
@version auto
@requires 8.0
@author Sean S. LeBlanc

@description
Adds support for items which, when picked up,
remove all other instances of that item from the game.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Update the `itemIsUnique` function to match your needs
*/
import bitsy from 'bitsy';
import { after } from './helpers/kitsy-script-toolkit';

export var hackOptions = {
	itemIsUnique: function (item) {
		// return item.name && item.name == 'tea'; // specific unique item
		// return ['tea', 'flower', 'hat'].indexOf(item.name) !== -1; // specific unique item list
		// return item.name && item.name.indexOf('UNIQUE') !== -1; // unique item flag in name
		return true; // all items are unique
	},
};

after('onInventoryChanged', function (id) {
	if (hackOptions.itemIsUnique(bitsy.tile[id])) {
		Object.values(bitsy.spriteInstances).forEach(function (instance) {
			if (instance.id === id) {
				delete bitsy.spriteInstances[instance.instanceId];
			}
		});
		Object.values(bitsy.room).forEach(function (room) {
			room.tilemap.forEach(function (row) {
				row.forEach(function (t, idx) {
					if (t === id) {
						row[idx] = '0';
					}
				});
			});
		});
	}
});

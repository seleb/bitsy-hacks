/**
👯‍♂️
@file edit player from dialog
@summary change which sprite is controlled by the player
@license MIT
@version auto
@requires 7.0
@author Sean S. LeBlanc

@description
You can use this to change which sprite is controlled by the player.

(player "target")
(playerNow "target")
Parameters:
	target: id/name of sprite that will be the new player

Examples:
(player "a")
(playerNow "a")

HOW TO USE:
	Copy-paste this script into a new script tag after the Bitsy source code.

NOTE:
- The original player sprite has an id of 'A' by default
- Inventory (i.e. item counts) is per-sprite, not shared.
  If you want to simulate "shared" inventory, include standard
  dialog variables on your items that increment when picked up
*/
import bitsy from 'bitsy';
import {
	addDualDialogTag,
} from './helpers/kitsy-script-toolkit';
import {
	getImage,
} from './helpers/utils';

addDualDialogTag('player', function (parameters) {
	var targetId = parameters[0];
	var target = getImage(targetId, bitsy.sprite);
	if (!target) {
		throw new Error('Could not change player: invalid sprite "' + targetId + '"');
	}
	if (!target.room) {
		throw new Error('Could not change player: sprite "' + targetId + '" not placed in a room');
	}
	bitsy.playerId = targetId;
	bitsy.curRoom = target.room;
});

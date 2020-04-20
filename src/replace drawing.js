/**
🎭
@file replace drawing
@summary add name-tags to replace drawings when the game is loading
@license MIT
@version 1.0.3
@requires 6.3
@author Elkie Nova

@description
add this tag to the name of the drawing you want to replace:
'#draw(TYPE,id)'
where 'TYPE' is TIL/SPR/ITM as displayed in bitsy data, and 'id' is what follows
said type right after, e.g. avatar's type is 'SPR', and avatar's id is 'A'
so if you would want to replace some drawing with the drawing of the avatar,
you would use '#draw(SPR,A)'

the point is to make it possible to have more convenient visuals when working
in the bitsy editor, then let the hack replace them with what you want
to show up in the actual game.
this hack is useful for working with stuff like invisible items, sprites, and walls,
and for creating helpful editor gizmos in 3d hack bitsies where you can have objects
whose visual properties in 3d are not fully reflected by their drawings in bitsy editor.
with this hack you can give them illustrative drawings to help you work in
the editor, while making them use the right drawings when rendered.

note, that this hack only replaces visuals, it doesn't change the behavior.
for example, this is what would happen if you added '#draw(ITM,0)' to bitsy cat's name:
after you have exported the game, added the hack and run it, bitsy cat would appear
as a cup of tea, but would say it's a cat, and you wouldn't be able to pick it up
like an item, because it would still function as a sprite!

HOW TO USE:
1. add '#draw(TYPE,id)' tag to the names of the drawings you want to replace when the game loads
2. copy-paste this script into a script tag after the bitsy source
*/
import bitsy from 'bitsy';
import {
	after,
} from './helpers/kitsy-script-toolkit';

after('parseWorld', function () {
	[].concat(Object.values(bitsy.item), Object.values(bitsy.tile), Object.values(bitsy.sprite)).forEach(function (drawing) {
		// replace drawings marked with the #draw(TYPE,id) tag
		var name = drawing.name || '';
		var tag = name.match(/#draw\((TIL|SPR|ITM),([a-zA-Z0-9]+)\)/);
		if (tag) {
			var map;
			// tag[1] is the first capturing group, it can be either TIL, SPR, or ITM
			switch (tag[1]) {
			case 'TIL':
				map = bitsy.tile;
				break;
			case 'SPR':
				map = bitsy.sprite;
				break;
			case 'ITM':
				map = bitsy.item;
				break;
			default:
				break;
			}
			// tag[2] is the second capturing group which returns drawing id
			var id = tag[2];
			var newDrawing = map[id];
			if (newDrawing) {
				drawing.drw = newDrawing.drw;
				drawing.animation.frameCount = newDrawing.animation.frameCount;
				drawing.animation.isAnimated = newDrawing.animation.isAnimated;
				drawing.col = newDrawing.col;
			} else {
				console.error(`couldn't replace ${drawing.name}! there is no '${tag[1]} ${id}'`);
			}
		}
	});
});

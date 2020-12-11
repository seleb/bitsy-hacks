/**
🎭
@file replace drawing
@summary add name-tags to replace drawings when the game is loading
@license MIT
@version auto
@requires 8.0
@author Elkie Nova

@description
add this tag to the name of the drawing you want to replace:
'#draw(id)'
where 'id' is a tile id

the point is to make it possible to have more convenient visuals when working
in the bitsy editor, then let the hack replace them with what you want
to show up in the actual game.
this hack is useful for working with stuff like invisible items, sprites, and walls,
and for creating helpful editor gizmos in 3d hack bitsies where you can have objects
whose visual properties in 3d are not fully reflected by their drawings in bitsy editor.
with this hack you can give them illustrative drawings to help you work in
the editor, while making them use the right drawings when rendered.

note, that this hack only replaces visuals, it doesn't change the behavior.
for example, this is what would happen if you added a tag to replace bitsy cat's with the teacup:
after you have exported the game, added the hack and run it, bitsy cat would appear
as a cup of tea, but would say it's a cat, and you wouldn't be able to pick it up
like an item, because it would still function as a sprite!

HOW TO USE:
1. add '#draw(id)' tag to the names of the drawings you want to replace when the game loads
2. copy-paste this script into a script tag after the bitsy source
*/
import bitsy from 'bitsy';
import { after } from './helpers/kitsy-script-toolkit';

after('parser.ParseWorld', function () {
	Object.values(bitsy.tile).forEach(function (drawing) {
		// replace drawings marked with the #draw(id) tag
		var name = drawing.name || '';
		var tag = name.match(/#draw\(([a-zA-Z0-9]+)\)/);
		if (tag) {
			var id = tag[1];
			var newDrawing = bitsy.tile[id];
			if (newDrawing) {
				drawing.drw = newDrawing.drw;
				drawing.animation = newDrawing.animation;
				drawing.col = newDrawing.col;
			} else {
				console.error(`couldn't replace ${drawing.name}! there is no '${tag[1]} ${id}'`);
			}
		}
	});
});

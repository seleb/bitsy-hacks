/*
bitsy hack - custom text effect

Adds support for a custom text effect
e.g. "normal text {my-effect}custom wavy text{my-effect}"

Multiple text effects can be added this way.
Without the hack, the game will still run normally since
bitsy just ignores text tags that aren't supported.

Because the dialog system uses private variables,
this one can't work as a simple drop-in script;
instead it is broken into two parts that have to be
inserted into specific parts of the bitsy source

HOW TO USE:
1. Search for `var functionMap = new Map();`
2. Copy-paste part 1 after it
3. Search for `var TextEffects = new Map();`
4. Copy-paste part 2 after it
5. Update "my-effect" and body of part 2 to be your custom effect
*/

/*
part 1
adds {my-effect} to the list of supported text effects
*/
functionMap.set("my-effect", function (environment, parameters, onReturn) {
	addOrRemoveTextEffect(environment, "my-effect");
	onReturn(null);
});


/*
part 2
defines the behaviour for {my-effect}

char properties:
	offset: offset from actual position in pixels. starts at {x:0, y:0}
	color: color of rendered text in [0-255]. starts at {r:255, g:255, b:255, a:255}
	char: character string (reset per dialog, not per frame)
	row: vertical position in rows (doesn't affect rendering)
	col: horizontal position in characters (doesn't affect rendering)
*/
TextEffects["my-effect"] = new(function () {
	this.DoEffect = function (char, time) {
		char.offset.x += 5 * Math.sin(time / 100 + char.col / 3);
		char.color.r = 255 * Math.cos(time / 100 + char.col / 3);
	}
});

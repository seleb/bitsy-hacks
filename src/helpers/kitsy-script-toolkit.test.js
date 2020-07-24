import {
	convertDialogTags
} from './kitsy-script-toolkit';

describe('convertDialogTags', () => {
	it('requires an input string and an input tag', () => {
		expect(() => convertDialogTags()).toThrow();
		expect(() => convertDialogTags('', '')).not.toThrow();
	});

	it('replaces `(tag)` with `{tag}`', () => {
		expect(convertDialogTags(`(tag)`, 'tag')).toEqual('{tag}');
	});

	it('replaces `(tag "input")` with `{tag "input"}`', () => {
		expect(convertDialogTags(`(tag "input")`, 'tag')).toEqual('{tag "input"}');
	});

	it('replaces `(tag input)` with `{tag input}`', () => {
		expect(convertDialogTags(`(tag input)`, 'tag')).toEqual('{tag input}');
	});

	it('replaces `\\(tag\\)` with `(tag)`', () => {
		expect(convertDialogTags(String.raw `\(tag\)`, 'tag')).toEqual('(tag)');
	});

	it('replaces `\\(tag "input"\\)` with `(tag "input")`', () => {
		expect(convertDialogTags(String.raw `\(tag "input"\)`, 'tag')).toEqual('(tag "input")');
	});

	it('replaces `\\(tag input\\)` with `(tag input)`', () => {
		expect(convertDialogTags(String.raw `\(tag input\)`, 'tag')).toEqual('(tag input)');
	});

	it('doesn\'t work when nested', () => {
		expect(convertDialogTags(`(js "(js "(js "")")")`, 'js')).toMatchSnapshot();
	});

	it('handles relatively complex cases', () => {
		// TODO: add some real-world gamedata examples
		expect(convertDialogTags(`a(js "console.log('a');")b{js "console.log('b');"}c(js "console.log('c');")d{js "console.log('d');"}e(js e)f{js f}e(js e)f{js f}`, 'js')).toMatchSnapshot();
		expect(convertDialogTags(String.raw `{cycle
			- (image "ITM, hud switch SOLID PERMANENT, hud on SOLID PERMANENT")\(image "ITM, 1HU display PERMANENT, 1HU on PERMANENT")(image "ITM, 2HU display PERMANENT, 2HU on PERMANENT")(image "ITM, 3HU display PERMANENT, 3HU on PERMANENT")(image "ITM, 4HU display PERMANENT, 4HU on PERMANENT")(image "ITM, 5HU display PERMANENT, 5HU on PERMANENT")(image "ITM, 6HU display PERMANENT, 6HU on PERMANENT")(image "ITM, 7HU display PERMANENT, 7HU on PERMANENT")(image "ITM, 8HU display PERMANENT, 8HU on PERMANENT")
			- (image "ITM, hud switch SOLID PERMANENT, hud off SOLID PERMANENT")(image "ITM, 1HU display PERMANENT, 1HU off PERMANENT")(image "ITM, 2HU display PERMANENT, 2HU off PERMANENT")(image "ITM, 3HU display PERMANENT, 3HU off PERMANENT")(image "ITM, 4HU display PERMANENT, 4HU off PERMANENT")(image "ITM, 5HU display PERMANENT, 5HU off PERMANENT")(image "ITM, 6HU display PERMANENT, 6HU off PERMANENT")(image "ITM, 7HU display PERMANENT, 7HU off PERMANENT")(image "ITM, 8HU display PERMANENT, 8HU off PERMANENT")
		  }`, 'image')).toMatchSnapshot();
		expect(convertDialogTags(String.raw `{cycle
			- (image "ITM, hud switch SOLID PERMANENT, hud on SOLID PERMANENT")
		  (image "ITM, 1HU display PERMANENT, 1HU on PERMANENT")
		  (image "ITM, 2HU display PERMANENT, 2HU on PERMANENT")
		  (image "ITM, 3HU display PERMANENT, 3HU on PERMANENT")
		  (image "ITM, 4HU display PERMANENT, 4HU on PERMANENT")
		  (image "ITM, 5HU display PERMANENT, 5HU on PERMANENT")
		  \(image "ITM, 6HU display PERMANENT, 6HU on PERMANENT")
		  (image "ITM, 7HU display PERMANENT, 7HU on PERMANENT")
		  (image "ITM, 8HU display PERMANENT, 8HU on PERMANENT")
			- (image "ITM, hud switch SOLID PERMANENT, hud off SOLID PERMANENT")
		  (image "ITM, 1HU display PERMANENT, 1HU off PERMANENT")
		  (image "ITM, 2HU display PERMANENT, 2HU off PERMANENT")
		  (image "ITM, 3HU display PERMANENT, 3HU off PERMANENT")
		  \(image "ITM, 4HU display PERMANENT, 4HU off PERMANENT")
		  \(image "ITM, 5HU display PERMANENT, 5HU off PERMANENT")
		  (image "ITM, 6HU display PERMANENT, 6HU off PERMANENT")
		  (image "ITM, 7HU display PERMANENT, 7HU off PERMANENT")
		  (image "ITM, 8HU display PERMANENT, 8HU off PERMANENT")
		  }`, 'image')).toMatchSnapshot();
		expect(convertDialogTags(convertDialogTags('(a "")(b "")', 'a'), 'b')).toMatchSnapshot();
		expect(convertDialogTags(convertDialogTags('(a "")(b "")', 'b'), 'a')).toMatchSnapshot();
	});
})

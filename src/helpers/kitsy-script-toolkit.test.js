import {
	convertDialogTags
} from './kitsy-script-toolkit';

describe('convertDialogTags', ()=>{
	it('requires an input string and an input tag', ()=>{
		expect(()=>convertDialogTags()).toThrow();
		expect(()=>convertDialogTags('', '')).not.toThrow();
	});

	it('replaces `(tag "input")` with `{tag "input"}`', ()=>{
		expect(convertDialogTags(`(tag "input")`, 'tag')).toMatchSnapshot();
	});

	it('replaces `(tag input)` with `{tag input}`', ()=>{
		expect(convertDialogTags(`(tag input)`, 'tag')).toMatchSnapshot();
	});

	it('replaces `\\(tag "input"\\)` with `(tag "input")`', ()=>{
		expect(convertDialogTags(`\(tag "input"\)`, 'tag')).toMatchSnapshot();
	});

	it('replaces `\\(tag input\\)` with `(tag input)`', ()=>{
		expect(convertDialogTags(`\(tag input\)`, 'tag')).toMatchSnapshot();
	});

	it('doesn\'t work when nested', ()=>{
		expect(convertDialogTags(`(js "(js "(js "")")")`, 'js')).toMatchSnapshot();
	});

	it('handles relatively complex cases', ()=>{
		// TODO: add some real-world gamedata examples
		expect(convertDialogTags(`a(js "console.log('a');")b{js "console.log('b');"}c(js "console.log('c');")d{js "console.log('d');"}e(js e)f{js f}e(js e)f{js f}`, 'js')).toMatchSnapshot();
	});
})
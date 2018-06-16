import {
	expose,
	flatten,
	inject,
	unique
} from './utils';

function constructor() {
	var privateVar = {
		privateVar: 'object',
	};
	this.getPrivateVar = function () {
		return privateVar;
	};
}

describe('expose', () => {
	it('requires a constructor', () => {
		expect(() => expose()).toThrow();
		expect(() => expose(constructor)).not.toThrow();
	});

	it('returns a new constructor', () => {
		expect(() => new(expose(constructor))).not.toThrow();
	});

	it('provides `get(name)` with access to constructor\'s scope', () => {
		const obj = new(expose(constructor));
		expect(obj.get('privateVar')).toBe(obj.getPrivateVar());
	});

	it('provides `set(name, value)` with access to constructor\'s scope', () => {
		const obj = new(expose(constructor));
		const newVal = {
			new: 'value',
		};
		obj.set('privateVar', newVal);
		expect(obj.get('privateVar')).toBe(newVal);
	});
});

describe('flatten', () => {
	it('returns the parameter if it is not an array', () => {
		expect(flatten()).toBe();
		expect(flatten('')).toBe('');
		expect(flatten(1)).toBe(1);
		expect(flatten(null)).toBe(null);
		const obj = {};
		expect(flatten(obj)).toBe(obj);
	});

	it('returns an array which is a copy of the parameter, fully flattened', () => {
		expect(flatten([])).toMatchSnapshot();
		expect(flatten([1,2,3,4,5])).toMatchSnapshot();
		expect(flatten([1,[2,3],4,5])).toMatchSnapshot();
		expect(flatten([1,[2,[3],4],5])).toMatchSnapshot();
		expect(flatten([1,[2,[3],[4],5]])).toMatchSnapshot();
		expect(flatten([[[[1]]],[2,[3],[4],5]])).toMatchSnapshot();
	});
});

xdescribe('inject', () => {
	it('requires a search string and a string to inject', () => {
	});

	it('replaces the script tag containing the search string with a copy containing the code to inject after the search string', () => {
	});
});

describe('unique', () => {
	it('requires an array as a paramter', () => {
		expect(()=>unique()).toThrow();
		expect(()=>unique([])).not.toThrow();
	});

	it('returns an array which is a copy of the parameter, without duplicates', () => {
		const obj={};
		expect(unique([])).toMatchSnapshot();
		expect(unique([1,1,1,2,3,4,1,2,3,4,5,1,4,5])).toMatchSnapshot();
		expect(unique(['a','b','c','a','b','c','A','A'])).toMatchSnapshot();
		expect(unique([obj,obj,obj])).toMatchSnapshot();
		expect(unique([1,'1',obj,obj,'1',1])).toMatchSnapshot();
	});
});
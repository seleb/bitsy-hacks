import {
	expose,
	getImage,
	inject,
	unique,
	getRelativeNumber,
	clamp
} from './utils';

function constructor() {
	var privateVar = {
		privateVar: 'object',
	};
	this.getPrivateVar = function () {
		return privateVar;
	};
}

describe('getImage', () => {
	it('requires a name/id and a map', () => {
		expect(() => getImage()).toThrow();
		expect(() => getImage('', {})).not.toThrow();
	});

	it('returns the image in the map with the provided id if it exists', () => {
		const map = {
			a: {}
		};
		expect(getImage('a', map)).toBe(map.a);
	});

	it('returns the first image in the map with the provided name if one exists', () => {
		const map = {
			a: {
				name: '1',
				order: 1,
			},
			b: {
				name: '1',
				order: 2,
			}
		};
		expect(getImage('1', map)).toBe(map.a);
	});

	it('returns the image in the map with the provided id if there exists both an image with that id, and with that name', () => {
		const map = {
			a: {},
			b: {
				name: 'a'
			}
		};
		expect(getImage('a', map)).toBe(map.a);
	});
});

xdescribe('inject', () => {
	it('requires a search string and a string to inject', () => {});

	it('replaces the script tag containing the search string with a copy containing the code to inject after the search string', () => {});
});

describe('unique', () => {
	it('requires an array as a paramter', () => {
		expect(() => unique()).toThrow();
		expect(() => unique([])).not.toThrow();
	});

	it('returns an array which is a copy of the parameter, without duplicates', () => {
		const obj = {};
		expect(unique([])).toMatchSnapshot();
		expect(unique([1, 1, 1, 2, 3, 4, 1, 2, 3, 4, 5, 1, 4, 5])).toMatchSnapshot();
		expect(unique(['a', 'b', 'c', 'a', 'b', 'c', 'A', 'A'])).toMatchSnapshot();
		expect(unique([obj, obj, obj])).toMatchSnapshot();
		expect(unique([1, '1', obj, obj, '1', 1])).toMatchSnapshot();
	});
});

describe('getRelativeNumber', () => {
	it('returns the sum of the value and the relativeTo if the value is a string starting with a + or -', () => {
		expect(getRelativeNumber('+1', 5)).toBe(6);
		expect(getRelativeNumber('-1', 5)).toBe(4);
	});
	it('returns the relativeTo if value is not a number or a number in a string', () => {
		expect(getRelativeNumber('', 5)).toBe(5);
		expect(getRelativeNumber(false, 5)).toBe(5);
		expect(getRelativeNumber(null, 5)).toBe(5);
		expect(getRelativeNumber(undefined, 5)).toBe(5);
	});
	it('returns the value as a number otherwise', () => {
		expect(getRelativeNumber('1', 5)).toBe(1);
		expect(getRelativeNumber(1, 5)).toBe(1);
		expect(getRelativeNumber(0, 5)).toBe(0);
		expect(getRelativeNumber(-1, 5)).toBe(-1);
	});
});

describe('clamp', () => {
	it('returns the min if the value is less than the min', () => {
		expect(clamp(0, 1, 3)).toBe(1);
	});
	it('returns the max if the value is greater than the max', () => {
		expect(clamp(4, 1, 3)).toBe(3);
	});
	it('returns the value otherwise', () => {
		expect(clamp(1, 1, 3)).toBe(1);
		expect(clamp(2, 1, 3)).toBe(2);
		expect(clamp(3, 1, 3)).toBe(3);
	});
});

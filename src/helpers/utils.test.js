import {
	expose
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
})
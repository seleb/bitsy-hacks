import {
	toMatchImageSnapshot
} from 'jest-image-snapshot';
expect.extend({
	toMatchImageSnapshot
});
jest.setTimeout(20000);

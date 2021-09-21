import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { bitsyAfterAll, bitsyAfterEach, bitsyBeforeAll } from './bitsy';

expect.extend({
	toMatchImageSnapshot,
});
jest.setTimeout(20000);
beforeAll(async () => {
	await bitsyBeforeAll();
});
afterEach(async () => {
	await bitsyAfterEach();
});
afterAll(async () => {
	await bitsyAfterAll();
});

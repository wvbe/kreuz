import { expect } from '@jest/globals';
import { EventedNumericValue } from './EventedNumericValue';

describe('EventedNumericValue', () => {
	it('.onBetween()', async () => {
		const value = new EventedNumericValue(0, 'test');
		const cb = jest.fn();
		value.onBetween(2, 5, cb, { min: false, max: false });

		// Out of range
		await value.set(1);
		expect(cb).toHaveBeenCalledTimes(0);

		// Out of range because not inclusive
		await value.set(2);
		expect(cb).toHaveBeenCalledTimes(0);

		// In range for the first time
		await value.set(3);
		expect(cb).toHaveBeenCalledTimes(1);

		// In range again
		await value.set(4);
		expect(cb).toHaveBeenCalledTimes(1);

		// Out of range because not inclusive
		await value.set(5);
		expect(cb).toHaveBeenCalledTimes(1);

		// Out of range
		await value.set(6);
		expect(cb).toHaveBeenCalledTimes(1);

		// Back in range
		await value.set(4);
		expect(cb).toHaveBeenCalledTimes(2);
	});

	it('.onceBetween()', async () => {
		const value = new EventedNumericValue(0, 'test');
		const cb = jest.fn();
		value.onceBetween(2, 5, cb, { min: false, max: false });

		// Out of range
		await value.set(1);
		expect(cb).toHaveBeenCalledTimes(0);

		// Out of range because not inclusive
		await value.set(2);
		expect(cb).toHaveBeenCalledTimes(0);

		// In range for the first time
		await value.set(3);
		expect(cb).toHaveBeenCalledTimes(1);

		// In range again
		await value.set(4);
		expect(cb).toHaveBeenCalledTimes(1);

		// Out of range because not inclusive
		await value.set(5);
		expect(cb).toHaveBeenCalledTimes(1);

		// Out of range
		await value.set(6);
		expect(cb).toHaveBeenCalledTimes(1);

		// Back in range
		await value.set(4);
		expect(cb).toHaveBeenCalledTimes(1);
	});
});

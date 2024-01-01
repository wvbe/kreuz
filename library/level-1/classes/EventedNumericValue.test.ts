import { expect, it, describe, mock, run } from 'tincan';
import { EventedNumericValue } from './EventedNumericValue.ts';

describe('EventedNumericValue', () => {
	it('Save/load round-robins to an equal object', () => {
		const value = new EventedNumericValue(5, 'test');
		expect(value).toEqual(EventedNumericValue.fromSaveJson(value.toSaveJson()));
	});
	it('.onBetween()', () => {
		const value = new EventedNumericValue(0, 'test');
		const cb = mock.fn();
		value.onBetween(2, 5, cb, { min: false, max: false });

		// Out of range
		value.set(1);
		expect(cb).toHaveBeenCalledTimes(0);

		// Out of range because not inclusive
		value.set(2);
		expect(cb).toHaveBeenCalledTimes(0);

		// In range for the first time
		value.set(3);
		expect(cb).toHaveBeenCalledTimes(1);

		// In range again
		value.set(4);
		expect(cb).toHaveBeenCalledTimes(1);

		// Out of range because not inclusive
		value.set(5);
		expect(cb).toHaveBeenCalledTimes(1);

		// Out of range
		value.set(6);
		expect(cb).toHaveBeenCalledTimes(1);

		// Back in range
		value.set(4);
		expect(cb).toHaveBeenCalledTimes(2);
	});

	it('.onceBetween()', () => {
		const value = new EventedNumericValue(0, 'test');
		const cb = mock.fn();
		value.onceBetween(2, 5, cb, { min: false, max: false });

		// Out of range
		value.set(1);
		expect(cb).toHaveBeenCalledTimes(0);

		// Out of range because not inclusive
		value.set(2);
		expect(cb).toHaveBeenCalledTimes(0);

		// In range for the first time
		value.set(3);
		expect(cb).toHaveBeenCalledTimes(1);

		// In range again
		value.set(4);
		expect(cb).toHaveBeenCalledTimes(1);

		// Out of range because not inclusive
		value.set(5);
		expect(cb).toHaveBeenCalledTimes(1);

		// Out of range
		value.set(6);
		expect(cb).toHaveBeenCalledTimes(1);

		// Back in range
		value.set(4);
		expect(cb).toHaveBeenCalledTimes(1);
	});
});

run();

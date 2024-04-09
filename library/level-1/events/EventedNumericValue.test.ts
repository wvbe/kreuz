import { expect, mock } from '@test';
import { SaveJsonContext } from '../types-savedgame.ts';
import { EventedNumericValue } from './EventedNumericValue.ts';

Deno.test('EventedNumericValue', async (test) => {
	await test.step('Save/load round-robins to an equal object', async () => {
		const value = new EventedNumericValue(5, 'test');
		expect(value).toEqual(
			await EventedNumericValue.fromSaveJson(value.toSaveJson({} as SaveJsonContext)),
		);
	});
	await test.step('.onBetween()', async () => {
		const value = new EventedNumericValue(0, 'test');
		const cb = mock.fn();
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

	await test.step('.onceBetween()', async () => {
		const value = new EventedNumericValue(0, 'test');
		const cb = mock.fn();
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

import { expect, mock } from '@test';
import { Material, Inventory } from '@lib';

const test1 = new Material('wheat', { symbol: '🌾', stackSize: 25 });
const test2 = new Material('barley', { symbol: '𐂏', stackSize: 33 });

const godInventory = new Inventory();
await godInventory.change(test1, Infinity);
await godInventory.change(test2, Infinity);

Deno.test('Inventory', async (test) => {
	await test.step('.availableOf()', async () => {
		const inventory = new Inventory();
		await inventory.set(test1, 100);
		await inventory.set(test2, 420);
		expect(inventory.availableOf(test1)).toBe(100);
		expect(inventory.availableOf(test2)).toBe(420);
	});
	await test.step('.getAvailableItems()', async () => {
		const inventory = new Inventory();
		await inventory.set(test1, 100);
		await inventory.set(test2, 420);
		inventory.makeReservation('test1', [{ material: test1, quantity: -100 }]);
		inventory.makeReservation('test2', [{ material: test2, quantity: 10 }]);
		expect(inventory.getAvailableItems()).toEqual([
			// { material: test1, quantity: 0 },
			{ material: test2, quantity: 420 },
		]);
	});
	await test.step('.reservedIncomingOf()', () => {
		const inventory = new Inventory(1);
		inventory.makeReservation('test', [{ material: test1, quantity: 10 }]);
		expect(inventory.reservedIncomingOf(test1)).toBe(10);
		expect(inventory.availableOf(test1)).toBe(0);
		expect(inventory.amountAllocatableTo(test1)).toBe(25);
	});
	await test.step('.reservedOutgoingOf()', async () => {
		const inventory = new Inventory(1);
		await inventory.set(test1, 15);
		inventory.makeReservation('test', [{ material: test1, quantity: -10 }]);
		expect(inventory.reservedOutgoingOf(test1)).toBe(10);
		expect(inventory.availableOf(test1)).toBe(5);
		expect(inventory.amountAllocatableTo(test1)).toBe(25);
	});
	await test.step('.getReservedIncomingItems()', () => {
		const inventory = new Inventory();
		inventory.changeMultiple([
			{ material: test1, quantity: 99 },
			{ material: test2, quantity: 99 },
		]);
		inventory.makeReservation('test', [
			{ material: test1, quantity: 1 },
			{ material: test2, quantity: 1 },
		]);
		expect(inventory.getReservedIncomingItems()).toEqual([
			{ material: test1, quantity: 1 },
			{ material: test2, quantity: 1 },
		]);
	});
	await test.step('.getStacks()', async () => {
		const inventory = new Inventory();
		await inventory.set(test1, 10);
		await inventory.set(test2, 100);
		expect(inventory.getStacks()).toEqual([
			{ material: test1, quantity: 10 },
			{ material: test2, quantity: 33 },
			{ material: test2, quantity: 33 },
			{ material: test2, quantity: 33 },
			{ material: test2, quantity: 1 },
		]);
	});
	await test.step('.getStacks() with a single item stack size', async () => {
		const test3 = new Material('barley', { symbol: '𐂏', stackSize: 1 });
		const inventory = new Inventory();
		await inventory.set(test3, 1);
		expect(inventory.getStacks()).toEqual([{ material: test3, quantity: 1 }]);
	});
	await test.step('.getUsedStackSpace()', async () => {
		const inventory = new Inventory();
		await inventory.set(test1, 10);
		await inventory.set(test2, 100);
		expect(inventory.getUsedStackSpace()).toBe(5);
	});
	await test.step('.isEverythingAllocatable()', async () => {
		const inventory = new Inventory(2);
		expect(
			inventory.isEverythingAdditionallyAllocatable([
				{ material: test1, quantity: 25 },
				{ material: test2, quantity: 10 },
				{ material: test2, quantity: 23 },
			]),
		).toBeTruthy();
		await inventory.change(test1, 1);
		expect(
			inventory.isEverythingAdditionallyAllocatable([
				{ material: test1, quantity: 25 },
				{ material: test2, quantity: 1 },
			]),
		).toBeFalsy();
	});
	await test.step('.isEverythingAllocatable() with reservation', async () => {
		const inventory = new Inventory(2);
		const additionalItems = [
			{ material: test1, quantity: 25 },
			// { material: test2, quantity: 10 },
			{ material: test2, quantity: 23 },
		];

		// If you ask before a reservation is made, all is cool
		expect(inventory.isEverythingAdditionallyAllocatable(additionalItems)).toBeTruthy();

		// If you ask after a reservation is made, the reserved items are "in the way" of what
		// you're trying to allocate
		inventory.makeReservation('test', [{ material: test2, quantity: 11 }]);
		expect(inventory.isEverythingAdditionallyAllocatable(additionalItems)).toBeFalsy();

		// Clear the reservation, and everything is cool again
		inventory.clearReservation('test');
		expect(inventory.isEverythingAdditionallyAllocatable(additionalItems)).toBeTruthy();
	});
	await test.step('.set()', async () => {
		const inventory = new Inventory(2);
		await inventory.set(test2, 33);
		expect(inventory.availableOf(test2)).toBe(33);

		expect(await inventory.set(test1, -1).catch((e) => e.message)).toEqual(
			`Cannot have a negative amount of 🌾 wheat`,
		);
		expect(await inventory.set(test1, 26).catch((e) => e.message)).toEqual(
			`Not enough stack space for 26x 🌾 wheat`,
		);

		await inventory.change(test2, -33);
		expect(inventory.availableOf(test2)).toBe(0);
	});
	await test.step('.changeMultiple()', async () => {
		const inventory = new Inventory(2);
		const cb = mock.fn();
		inventory.$change.on(cb);
		await inventory.changeMultiple([
			{ material: test1, quantity: 1 },
			{ material: test2, quantity: 1 },
		]);
		expect(cb).toHaveBeenCalledTimes(1);
	});
});

Deno.test('Issues', async (test) => {
	await test.step('.set() does not allow setting to beyond half the available space', async () => {
		// Reproduction case is to fill the inventory with an item half-way, and then add one more:
		const inventory = new Inventory(2);
		await inventory.set(test2, 33);
		expect(async () => {
			await inventory.set(test2, 34);
		}).not.toThrow();
		expect(inventory.availableOf(test2)).toBe(34);
	});

	await test.step('.isEverythingAllocatable() responds false while .additionalyAllocatableTo doesnt', async () => {
		const inventory = new Inventory(8);

		const copper = new Material('Copper ingot', { symbol: 'C', stackSize: 30 });
		const tin = new Material('Tin ingot', { symbol: 'T', stackSize: 30 });
		const bronze = new Material('Bronze ingot', { symbol: 'B', stackSize: 30 });
		await inventory.changeMultiple([
			{ material: copper, quantity: 24 },
			{ material: tin, quantity: 12 },
			{ material: bronze, quantity: 176 },
		]);
		inventory.makeReservation('transport-job-602', [{ material: copper, quantity: 5 }]);

		expect(inventory.amountAdditionallyAllocatableTo(copper)).toBe(1);
		expect(inventory.isAdditionallyAllocatableTo(copper, 5)).toBe(false);
		expect(inventory.isEverythingAdditionallyAllocatable([{ material: copper, quantity: 5 }])).toBe(
			inventory.isAdditionallyAllocatableTo(copper, 5),
		);
	});
});

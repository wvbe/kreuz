import { describe, expect, it, mock, run } from '@test';
import { TradeOrder } from '../../../classes/TradeOrder.ts';
import { Inventory } from './Inventory.ts';
import { Material } from '../../../inventory/Material.ts';
import { MaterialState } from '../../../inventory/types.ts';
import { personArchetype } from '../../archetypes/personArchetype.ts';

const test1 = new Material('wheat', { symbol: '🌾', stackSize: 25 });
const test2 = new Material('barley', { symbol: '𐂏', stackSize: 33 });

function createTradeOrderForCargo(
	inventory1: Inventory,
	cargo1: MaterialState[],
	inventory2: Inventory,
	cargo2: MaterialState[],
): TradeOrder {
	return new TradeOrder(
		{
			owner: personArchetype.create({
				location: [0, 0, Infinity],
				icon: '🤖',
				name: 'test A',
				behavior: null,
			}),
			inventory: inventory1,
			money: 0,
			cargo: cargo1,
		},
		{
			owner: personArchetype.create({
				location: [0, 0, Infinity],
				icon: '🤖',
				name: 'test B',
				behavior: null,
			}),
			inventory: inventory2,
			money: 0,
			cargo: cargo2,
		},
	);
}

const godInventory = new Inventory();
await godInventory.change(test1, Infinity);
await godInventory.change(test2, Infinity);

describe('Inventory', () => {
	it('.availableOf()', async () => {
		const inventory = new Inventory();
		await inventory.set(test1, 100);
		await inventory.set(test2, 420);
		expect(inventory.availableOf(test1)).toBe(100);
		expect(inventory.availableOf(test2)).toBe(420);
	});
	it('.reservedIncomingOf()', () => {
		const inventory = new Inventory(1);
		const tradeOrder = createTradeOrderForCargo(
			godInventory,
			[{ material: test1, quantity: 10 }],
			inventory,
			[],
		);
		inventory.makeReservationFromTradeOrder(tradeOrder);
		expect(inventory.reservedIncomingOf(test1)).toBe(10);
		expect(inventory.availableOf(test1)).toBe(0);
		expect(inventory.amountAllocatableTo(test1)).toBe(25);
	});
	it('.reservedOutgoingOf()', async () => {
		const inventory = new Inventory(1);
		await inventory.set(test1, 15);
		const tradeOrder = createTradeOrderForCargo(
			inventory,
			[{ material: test1, quantity: 10 }],
			godInventory,
			[],
		);
		inventory.makeReservationFromTradeOrder(tradeOrder);
		expect(inventory.reservedOutgoingOf(test1)).toBe(10);
		expect(inventory.availableOf(test1)).toBe(5);
		expect(inventory.amountAllocatableTo(test1)).toBe(25);
	});
	it('.getReservedIncomingItems()', () => {
		const inventory = new Inventory();
		inventory.changeMultiple([
			{ material: test1, quantity: 99 },
			{ material: test2, quantity: 99 },
		]);
		inventory.makeReservationFromTradeOrder(
			createTradeOrderForCargo(
				godInventory,
				[
					{ material: test1, quantity: 1 },
					{ material: test2, quantity: 1 },
				],
				inventory,
				[],
			),
		);
		expect(inventory.getReservedIncomingItems()).toEqual([
			{ material: test1, quantity: 1 },
			{ material: test2, quantity: 1 },
		]);
	});
	it('.getStacks()', async () => {
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
	it('.getStacks() with a single item stack size', async () => {
		const test3 = new Material('barley', { symbol: '𐂏', stackSize: 1 });
		const inventory = new Inventory();
		await inventory.set(test3, 1);
		expect(inventory.getStacks()).toEqual([{ material: test3, quantity: 1 }]);
	});
	it('.getUsedStackSpace()', async () => {
		const inventory = new Inventory();
		await inventory.set(test1, 10);
		await inventory.set(test2, 100);
		expect(inventory.getUsedStackSpace()).toBe(5);
	});
	it('.isEverythingAllocatable()', async () => {
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
	it('.isEverythingAllocatable() with reservation', async () => {
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
	it('.set()', async () => {
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
	it('.changeMultiple()', async () => {
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

describe('Issues', () => {
	it('.set() does not allow setting to beyond half the available space', async () => {
		// Reproduction case is to fill the inventory with an item half-way, and then add one more:
		const inventory = new Inventory(2);
		await inventory.set(test2, 33);
		expect(async () => {
			await inventory.set(test2, 34);
		}).not.toThrow();
		expect(inventory.availableOf(test2)).toBe(34);
	});

	it('.isEverythingAllocatable() responds false while .additionalyAllocatableTo doesnt', async () => {
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

run();

// describe('getRequiredStackSpace', () => {
// 	it('should return 0 for an empty cargo', () => {
// 		const cargo: MaterialState[] = [];
// 		const result = getRequiredStackSpace(cargo);
// 		expect(result).toBe(0);
// 	});

// 	it('should return the correct stack space for a single material', () => {
// 		const cargo: MaterialState[] = [
// 			{ material: test1, quantity: 10 },
// 			{ material: test1, quantity: 15 },
// 			{ material: test1, quantity: 5 },
// 		];
// 		const result = getRequiredStackSpace(cargo);
// 		expect(result).toBe(2); // 10 + 15 + 5 = 30, 30 / 25 = 1.2, ceil(1.2) = 2
// 	});

// 	it('should return the correct stack space for multiple materials', () => {
// 		const cargo: MaterialState[] = [
// 			{ material: test1, quantity: 10 },
// 			{ material: test2, quantity: 33 },
// 			{ material: test1, quantity: 25 },
// 			{ material: test2, quantity: 20 },
// 		];
// 		const result = getRequiredStackSpace(cargo);
// 		expect(result).toBe(5); // 10 + 25 = 35, 35 / 25 = 1.4, ceil(1.4) = 2
// 		// 33 + 20 = 53, 53 / 33 = 1.606, ceil(1.606) = 2
// 		// Total: 2 + 2 = 4
// 	});
// });

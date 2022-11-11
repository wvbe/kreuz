import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { Inventory } from './Inventory.ts';
import { Material } from './Material.ts';
import { TradeOrder } from '../classes/TradeOrder.ts';
import { PersonEntity } from '../entities/entity.person.ts';
import { MaterialState } from './types.ts';

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
			owner: new PersonEntity(
				'a',
				{ x: 0, y: 0, z: Infinity },
				{ gender: 'm', firstName: 'test A' },
			),
			inventory: inventory1,
			money: 0,
			cargo: cargo1,
		},
		{
			owner: new PersonEntity(
				'b',
				{ x: 0, y: 0, z: Infinity },
				{ gender: 'f', firstName: 'test B' },
			),
			inventory: inventory2,
			money: 0,
			cargo: cargo2,
		},
	);
}

const godInventory = new Inventory();
godInventory.change(test1, Infinity);
godInventory.change(test2, Infinity);

describe('Inventory', () => {
	it('.availableOf()', () => {
		const inventory = new Inventory();
		inventory.set(test1, 100);
		inventory.set(test2, 420);
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
		inventory.makeReservation(tradeOrder);
		expect(inventory.reservedIncomingOf(test1)).toBe(10);
		expect(inventory.availableOf(test1)).toBe(0);
		expect(inventory.allocatableTo(test1)).toBe(25);
	});
	it('.reservedOutgoingOf()', () => {
		const inventory = new Inventory(1);
		inventory.set(test1, 15);
		const tradeOrder = createTradeOrderForCargo(
			inventory,
			[{ material: test1, quantity: 10 }],
			godInventory,
			[],
		);
		inventory.makeReservation(tradeOrder);
		expect(inventory.reservedOutgoingOf(test1)).toBe(10);
		expect(inventory.availableOf(test1)).toBe(5);
		expect(inventory.allocatableTo(test1)).toBe(25);
	});
	it('.getReservedIncomingItems()', () => {
		const inventory = new Inventory();
		inventory.changeMultiple([
			{ material: test1, quantity: 99 },
			{ material: test2, quantity: 99 },
		]);
		inventory.makeReservation(
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
	it('.getStacks()', () => {
		const inventory = new Inventory();
		inventory.set(test1, 10);
		inventory.set(test2, 100);
		expect(inventory.getStacks()).toEqual([
			{ material: test1, quantity: 10 },
			{ material: test2, quantity: 33 },
			{ material: test2, quantity: 33 },
			{ material: test2, quantity: 33 },
			{ material: test2, quantity: 1 },
		]);
	});
	it('.getStacks() with a single item stack size', () => {
		const test3 = new Material('barley', { symbol: '𐂏', stackSize: 1 });
		const inventory = new Inventory();
		inventory.set(test3, 1);
		expect(inventory.getStacks()).toEqual([{ material: test3, quantity: 1 }]);
	});
	it('.getUsedStackSpace()', () => {
		const inventory = new Inventory();
		inventory.set(test1, 10);
		inventory.set(test2, 100);
		expect(inventory.getUsedStackSpace()).toBe(5);
	});
	it('.isEverythingAllocatable()', () => {
		const inventory = new Inventory(2);
		expect(
			inventory.isEverythingAllocatable([
				{ material: test1, quantity: 25 },
				{ material: test2, quantity: 10 },
				{ material: test2, quantity: 23 },
			]),
		).toBeTruthy();
		inventory.change(test1, 1);
		expect(
			inventory.isEverythingAllocatable([
				{ material: test1, quantity: 25 },
				{ material: test2, quantity: 10 },
				{ material: test2, quantity: 23 },
			]),
		).toBeFalsy();
	});
	it('.isEverythingAllocatable() with reservation', () => {
		const inventory = new Inventory(2);
		const tradeOrder = createTradeOrderForCargo(
			godInventory,
			[{ material: test2, quantity: 10 }],
			inventory,
			[],
		);
		inventory.makeReservation(tradeOrder);
		expect(
			inventory.isEverythingAllocatable([
				{ material: test1, quantity: 25 },
				// { material: test2, quantity: 10 },
				{ material: test2, quantity: 23 },
			]),
		).toBeTruthy();
		inventory.change(test1, 1);
		expect(
			inventory.isEverythingAllocatable([
				{ material: test1, quantity: 25 },
				// { material: test2, quantity: 10 },
				{ material: test2, quantity: 23 },
			]),
		).toBeFalsy();
	});
	it('.set()', () => {
		const inventory = new Inventory(2);
		inventory.set(test2, 33);
		expect(inventory.availableOf(test2)).toBe(33);

		expect(() => inventory.set(test1, -1)).toThrow(`Cannot have a negative amount of 🌾 wheat`);
		expect(() => inventory.set(test1, 26)).toThrow(`Not enough stack space for 26x 🌾 wheat`);

		inventory.change(test2, -33);
		expect(inventory.availableOf(test2)).toBe(0);
	});
});

describe('Issues', () => {
	it('.set() does not allow setting to beyond half the available space', () => {
		// Reproduction case is to fill the inventory with an item half-way, and then add one more:
		const inventory = new Inventory(2);
		inventory.set(test2, 33);
		expect(() => inventory.set(test2, 34)).not.toThrow();
		expect(inventory.availableOf(test2)).toBe(34);
	});
});

run();

import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { Inventory } from './Inventory.ts';
import { Material } from './Material.ts';

const test1 = new Material('wheat', { symbol: '🌾', stackSize: 25 });
const test2 = new Material('barley', { symbol: '𐂏', stackSize: 33 });

describe('Inventory', () => {
	it('.availableOf()', () => {
		const inventory = new Inventory();
		inventory.set(test1, 100);
		inventory.set(test2, 420);
		expect(inventory.availableOf(test1)).toBe(100);
		expect(inventory.availableOf(test2)).toBe(420);
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
	it('.set()', () => {
		const inventory = new Inventory(2);
		inventory.set(test2, 33);
		expect(inventory.availableOf(test2)).toBe(33);

		expect(() => inventory.set(test1, -1)).toThrow(`Cannot have a negative amount of wheat`);
		expect(() => inventory.set(test1, 26)).toThrow(`Not enough stack space for 26x wheat`);

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

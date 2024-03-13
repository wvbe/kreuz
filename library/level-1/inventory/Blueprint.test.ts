import { describe, expect, it, run } from '@test';
import { Blueprint } from './Blueprint.ts';
import { Inventory } from './Inventory.ts';
import { Material } from './Material.ts';

export const tinIngot = new Material('Tin ingot', {
		symbol: 'Ti',
		stackSize: 30,
	}),
	copperIngot = new Material('Copper ingot', {
		symbol: 'Ci',
		stackSize: 30,
	}),
	bronzeIngot = new Material('Bronze ingot', {
		symbol: 'Bi',
		stackSize: 30,
	}),
	bronzeIngotProduction = new Blueprint(
		'Making bronze ingots',
		[
			{ material: copperIngot, quantity: 0.88 },
			{ material: tinIngot, quantity: 0.12 },
		],
		[{ material: bronzeIngot, quantity: 1 }],
		{
			workersRequired: 2,
			fullTimeEquivalent: 5000,
			buildingName: 'Bronze foundry',
		},
	);

describe('Blueprint', () => {
	it('.transferIngredients()', async () => {
		const source = new Inventory();
		await source.change(tinIngot, 10);
		await source.change(copperIngot, 10);
		const destination = new Inventory();
		expect(source.availableOf(tinIngot)).toBe(10);
		expect(destination.availableOf(tinIngot)).toBe(0);
		await bronzeIngotProduction.transferIngredients(source, destination);
		expect(source.availableOf(tinIngot)).toBe(9.88);
		expect(destination.availableOf(tinIngot)).toBe(0.12);
	});

	it('.hasAllIngredients()', async () => {
		const source = new Inventory();
		await source.change(tinIngot, 10);
		expect(bronzeIngotProduction.hasAllIngredients(source)).toBeFalsy();
		await source.change(copperIngot, 10);
		expect(bronzeIngotProduction.hasAllIngredients(source)).toBeTruthy();
	});
});

run();

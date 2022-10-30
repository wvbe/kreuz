import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { copperIngot, tinIngot } from '../constants/materials.ts';
import { bronzeIngotProduction as blueprint } from '../constants/blueprints.ts';
import { Inventory } from './Inventory.ts';

describe('Blueprint', () => {
	it('.transferIngredients()', () => {
		const source = new Inventory();
		source.change(tinIngot, 10);
		source.change(copperIngot, 10);
		const destination = new Inventory();
		expect(source.availableOf(tinIngot)).toBe(10);
		expect(destination.availableOf(tinIngot)).toBe(0);
		blueprint.transferIngredients(source, destination);
		expect(source.availableOf(tinIngot)).toBe(9.88);
		expect(destination.availableOf(tinIngot)).toBe(0.12);
	});

	it('.hasAllIngredients()', () => {
		const source = new Inventory();
		source.change(tinIngot, 10);
		expect(blueprint.hasAllIngredients(source)).toBeFalsy();
		source.change(copperIngot, 10);
		expect(blueprint.hasAllIngredients(source)).toBeTruthy();
	});
});

run();

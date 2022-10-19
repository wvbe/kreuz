import { describe, run, expect, it } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import createFactoriesDemo from './factories.ts';
import { FactoryBuildingEntity, TestDriver } from '@lib';
import { ironIngot, rawIronOre } from '../src/constants/materials.ts';

describe('Factories', () => {
	const { driver, game } = createFactoriesDemo(new TestDriver());
	const factoryInventory = (game.entities.get(0) as FactoryBuildingEntity).inventory;

	it('The game finishes by itself', async () => {
		expect(await driver.start()).toBeUndefined();
	});

	it('The factory consumed iron ore', () => {
		expect(factoryInventory.availableOf(rawIronOre)).toBeLessThan(100);
	});

	it('The factory produced iron ingots', () => {
		expect(factoryInventory.availableOf(ironIngot)).toBeGreaterThan(0);
	});
});

run();

/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { FactoryBuildingEntity, Game, generateGridTerrainFromAscii, PersonEntity } from '@lib/core';
import { headOfState } from '../level-2/heroes.ts';
import { DEFAULT_ASSETS, materials } from '@lib/assets';
import { blueprints, behavior } from '@lib/assets';
import { Demo } from './types.ts';

const demo: Demo = async (driver) => {
	const terrain = generateGridTerrainFromAscii(`
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
	`);
	const game = new Game('1', terrain, DEFAULT_ASSETS);
	await driver.attach(game);

	const farm = new FactoryBuildingEntity(
		'farm',
		terrain.getTileClosestToXy(3, 3).toArray(),
		headOfState,
		{
			blueprint: blueprints.growWheat,
			maxWorkers: 1,
			maxStackSpace: 6,
		},
	);
	await farm.inventory.set(materials.wheat, 99);

	const mill = new FactoryBuildingEntity(
		'mill',
		terrain.getTileClosestToXy(8, 3).toArray(),
		headOfState,
		{
			blueprint: blueprints.milling,
			maxWorkers: 1,
			maxStackSpace: 6,
		},
	);

	await game.entities.add(farm, mill);

	for (let i = 0; i < 5; i++) {
		const entity = new PersonEntity(`person-${i}`, terrain.getTileClosestToXy(0, 0).toArray(), {
			gender: 'm',
			firstName: 'Melanie',
		});
		await game.entities.add(entity);
		await entity.$behavior.set(behavior.civilianBehavior);
	}

	return { driver, game };
};

export default demo;

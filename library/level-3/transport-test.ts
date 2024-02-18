/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import {
	FactoryBuildingEntity,
	Game,
	generateGridTerrainFromAscii,
	PersonEntity,
	materials,
} from '../level-1/mod.ts';
import { headOfState } from '../level-2/heroes.ts';
import { blueprints, bt } from '../level-2/mod.ts';
import { Demo } from './types.ts';

const demo: Demo = (driver) => {
	const terrain = generateGridTerrainFromAscii(`
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
	`);
	const game = new Game('1', terrain);
	driver.attach(game);

	const farm = new FactoryBuildingEntity(
		'farm',
		terrain.getTileClosestToXy(3, 3).toArray(),
		headOfState,
		{
			maxStackSpace: 6,
		},
	);
	farm.setBlueprint(blueprints.growWheat);
	farm.inventory.set(materials.wheat, 99);

	const mill = new FactoryBuildingEntity(
		'mill',
		terrain.getTileClosestToXy(8, 3).toArray(),
		headOfState,
		{
			maxStackSpace: 6,
		},
	);
	mill.setBlueprint(blueprints.wheatProcessing);

	game.entities.add(farm, mill);

	for (let i = 0; i < 5; i++) {
		const entity = new PersonEntity(`person-${i}`, terrain.getTileClosestToXy(0, 0).toArray(), {
			gender: 'm',
			firstName: 'Melanie',
		});
		game.entities.add(entity);
		entity.$behavior.set(bt.civvyBehavior);
	}

	return { driver, game };
};

export default demo;

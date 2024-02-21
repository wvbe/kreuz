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
} from '../level-1/mod.ts';
import { headOfState } from '../level-2/heroes.ts';
import { blueprints, DEFAULT_ASSETS } from '../level-2/mod.ts';
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

	const entity = new PersonEntity('1', terrain.getTileClosestToXy(0, 0).toArray(), {
		gender: 'm',
		firstName: 'Melanie',
	});
	await game.entities.add(entity);

	const well = new FactoryBuildingEntity(
		'2',
		terrain.getTileClosestToXy(3, 3).toArray(),
		headOfState,
		{
			blueprint: blueprints.getWaterFromWell,
			maxWorkers: 0,
			maxStackSpace: 1,
		},
	);
	await game.entities.add(well);

	return { driver, game };
};

export default demo;

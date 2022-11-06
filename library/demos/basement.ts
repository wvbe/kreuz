/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { FactoryBuildingEntity, Game, generateGridTerrainFromAscii, PersonEntity } from '@lib';
import { getWaterFromWell } from '../objects/constants/blueprints.ts';
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

	const entity = new PersonEntity('1', terrain.getTileClosestToXy(0, 0));
	game.entities.add(entity);

	const well = new FactoryBuildingEntity('2', terrain.getTileClosestToXy(3, 3), { maxWorkers: 0 });
	game.entities.add(well);

	well.setBlueprint(getWaterFromWell);

	return { driver, game };
};

export default demo;

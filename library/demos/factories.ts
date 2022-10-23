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
	ProductionJob,
	blueprints,
	materials,
} from '@lib';
import { Demo } from './types.ts';

const demo: Demo = (driver) => {
	const terrain = generateGridTerrainFromAscii(`
		XXXX
		XXXX
		XXXX
		XXXX
	`);

	const game = new Game('1', terrain);
	driver.attach(game);

	const entity = new FactoryBuildingEntity('1', terrain.getTileClosestToXy(0, 0));

	const job = new ProductionJob(entity, null);
	entity.doJob(job);
	job.setBlueprint(blueprints.ironIngotProduction);
	game.entities.add(entity);

	// Game doesnt work if this line is moved up a few
	// @TODO find out why
	entity.inventory.set(materials.rawIronOre, 100);

	return { driver, game };
};

export default demo;

/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { Game, generateGridTerrainFromAscii, FactoryBuildingEntity } from '@lib';
import { ProductionJob } from '../src/jobs/ProductionJob.ts';
import { Demo } from './types.ts';
import { ironIngotProduction } from '../src/constants/blueprints.ts';
import { ironIngot, rawIronOre } from '../src/constants/materials.ts';

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

	const entity = new FactoryBuildingEntity('1', terrain.getTileClosestToXy(0, 0), {
		baseDepth: 1,
		baseHeight: 1,
		baseWidth: 1,
		roofHeight: 1,
	});

	game.entities.add(entity);

	const job = new ProductionJob(entity, null);
	entity.doJob(job);
	job.setBlueprint(ironIngotProduction);

	entity.inventory.set(rawIronOre, 100);

	console.log('Ready!');
	return { driver, game };
};

export default demo;

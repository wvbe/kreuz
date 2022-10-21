/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { ChurchBuildingEntity, Game, generateGridTerrainFromAscii } from '@lib';
import { PersonEntity } from '../src/entities/entity.person.ts';
import { SelfcareJob } from '../src/jobs/SelfcareJob.ts';
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

	game.entities.add(
		new ChurchBuildingEntity('1', terrain.getTileClosestToXy(0, 0)),
		new ChurchBuildingEntity('2', terrain.getTileClosestToXy(3, 3)),
		new ChurchBuildingEntity('3', terrain.getTileClosestToXy(0, 4)),
	);

	const entity = new PersonEntity('person', terrain.getTileClosestToXy(2, 1));
	const job = new SelfcareJob(entity);
	entity.doJob(job);
	game.entities.add(entity);

	return { driver, game };
};

export default demo;

/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { Game, generateGridTerrainFromAscii, PersonEntity, PersonNeedId } from '@lib';
import { PatrolTask } from '../src/tasks/task.patrol.ts';
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

	// entity.doJob(
	// 	new PatrolJob(entity, [terrain.getTileClosestToXy(0, 2), terrain.getTileClosestToXy(2, 2)]),
	// );
	const game = new Game('1', terrain);
	driver.attach(game);

	const entity = new PersonEntity('1', terrain.getTileClosestToXy(0, 0));
	game.entities.add(entity);

	entity.doJob(new PatrolTask({ repeating: true }));
	const entity2 = new PersonEntity('2', terrain.getTileClosestToXy(0, 0));
	game.entities.add(entity2);
	entity2.doJob(new PatrolTask({ repeating: false }));

	return { driver, game };
};

export default demo;

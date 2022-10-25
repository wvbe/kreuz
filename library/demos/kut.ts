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
	XXXXXXXXXXXXXXXXX
	XXXXXXXXXXXXXXXXX
	XXXXXXXXXXXXXXXXX
	XXXXXXXXXXXXXXXXX
	XXXXXXXXXXXXXXXXX
	XXXXXXXXXXXXXXXXX
`);
	const game = new Game('test', terrain);
	driver.attach(game);

	const entity = new PersonEntity('test', terrain.getTileClosestToXy(0, 0));
	game.entities.add(entity);
	entity.doJob(
		new PatrolTask({
			waypoints: [terrain.getTileClosestToXy(0, 2), terrain.getTileClosestToXy(2, 2)],
			repeating: true,
		}),
	);
	return { driver, game };
};

export default demo;

/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import {
	Blueprint,
	blueprints,
	ChurchBuildingEntity,
	FactoryBuildingEntity,
	Game,
	generateGridTerrainFromAscii,
	PersonEntity,
	Random,
	type TileI,
	ProductionTask,
	SelfcareTask,
	SettlementEntity,
} from '@lib';
import { LiveLawfully } from '../src/tasks/task.lawful-life.ts';
import { RepeatingTask } from '../src/tasks/task.repeat.ts';
import { Demo } from './types.ts';

function createFactoryForBlueprint(tile: TileI, blueprint: Blueprint) {
	const entity = new FactoryBuildingEntity('1', tile);
	const job = new ProductionTask(null);
	entity.doJob(job);
	job.setBlueprint(blueprint);
	return entity;
}
const demo: Demo = (driver) => {
	const terrain = generateGridTerrainFromAscii(`
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
	`);

	const game = new Game('1', terrain);
	driver.attach(game);

	for (let i = 0; i < 1; i++) {
		const entity = new PersonEntity(
			'person-' + i,
			terrain.getTileClosestToXy(
				Math.floor(Random.between(0, 10, 'zfs', i)),
				Math.floor(Random.between(0, 10, 'zfs', i + 'f')),
			),
		);
		game.entities.add(entity);
		const job = new LiveLawfully();
		entity.doJob(job);
	}

	game.entities.add(
		new ChurchBuildingEntity('1', terrain.getTileClosestToXy(3, 3)),
		new SettlementEntity('2', terrain.getTileClosestToXy(13, 8), {
			areaSize: 1,
			minimumBuildingLength: 1,
			scale: 1,
		}),
		// createFactoryForBlueprint(terrain.getTileClosestToXy(0, 0), blueprints.beeKeeping),
	);

	return { driver, game };
};

export default demo;

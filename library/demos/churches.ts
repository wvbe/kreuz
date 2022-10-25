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
	ChurchBuildingEntity,
	FactoryBuildingEntity,
	Game,
	generateGridTerrainFromAscii,
	LiveLawfully,
	PersonEntity,
	ProductionTask,
	Random,
	SelfcareTask,
	SettlementEntity,
	type TileI,
} from '@lib';
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

	const entity = new PersonEntity(
		'person-0',
		terrain.getTileClosestToXy(
			Math.floor(Random.between(0, 10, 'zfs', 0)),
			Math.floor(Random.between(0, 10, 'zfs', 0 + 'f')),
		),
	);
	entity.needs.food.set(0, false);
	entity.needs.water.set(0, false);
	entity.needs.hygiene.set(0, false);
	entity.needs.sleep.set(0, false);
	entity.needs.ideology.set(0, false);

	game.entities.add(entity);
	const job = new SelfcareTask();
	entity.doJob(job);

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

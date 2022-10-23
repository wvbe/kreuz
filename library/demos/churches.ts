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
	Game,
	generateGridTerrainFromAscii,
	blueprints,
	Random,
	type TileI,
	PersonEntity,
	FactoryBuildingEntity,
	ProductionJob,
	SelfcareJob,
} from '@lib';
import { Demo } from './types.ts';

function createFactoryForBlueprint(tile: TileI, blueprint: Blueprint) {
	const entity = new FactoryBuildingEntity('1', tile);
	const job = new ProductionJob(entity, null);
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

	for (let i = 0; i < 20; i++) {
		const entity = new PersonEntity(
			'person-' + i,
			terrain.getTileClosestToXy(
				Math.floor(Random.between(0, 10, 'zfs', i)),
				Math.floor(Random.between(0, 10, 'zfs', i + 'f')),
			),
		);
		const job = new SelfcareJob(entity);
		entity.doJob(job);
		game.entities.add(entity);
	}

	game.entities.add(
		new ChurchBuildingEntity('1', terrain.getTileClosestToXy(3, 3)),
		new ChurchBuildingEntity('2', terrain.getTileClosestToXy(13, 8)),
		new ChurchBuildingEntity('3', terrain.getTileClosestToXy(4, 6)),
		createFactoryForBlueprint(terrain.getTileClosestToXy(0, 0), blueprints.beeKeeping),
	);

	return { driver, game };
};

export default demo;

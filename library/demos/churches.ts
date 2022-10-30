/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import {
	ChurchBuildingEntity,
	Game,
	generateGridTerrainFromAscii,
	PersonEntity,
	Random,
	SettlementEntity,
} from '@lib';
import { Demo } from './types.ts';

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

	game.entities.add(entity);

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

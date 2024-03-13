/**
 * The expected outcome is a game that keeps on running.
 */

import {
	DEFAULT_ASSETS,
	DriverI,
	FactoryBuildingEntity,
	Game,
	PersonEntity,
	blueprints,
	materials,
} from '@lib';
import { generateGridTerrainFromAscii } from '@test';
import { createJobWorkBehavior } from '../library/level-2/behavior/reusable/nodes/createJobWorkBehavior.ts';
import { headOfState } from '../library/level-2/heroes/heroes.ts';

export default async function (driver: DriverI) {
	const terrain = generateGridTerrainFromAscii(`
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
	`);
	const game = new Game(driver, '1', terrain, DEFAULT_ASSETS);

	const factory = new FactoryBuildingEntity(
		'farm',
		terrain.getTileClosestToXy(3, 3).toArray(),
		headOfState,
		{
			blueprint: blueprints.beeKeeping,
			maxWorkers: 20,
			maxStackSpace: Infinity,
		},
	);
	await factory.inventory.set(materials.honey, 99);
	game.entities.add(factory);

	for (let i = 0; i < 5; i++) {
		const entity = new PersonEntity(`person-${i}`, terrain.getTileClosestToXy(0, 0).toArray(), {
			gender: 'm',
			firstName: 'Melanie',
		});
		await game.entities.add(entity);

		await entity.$behavior.set(createJobWorkBehavior());
	}

	return game;
}

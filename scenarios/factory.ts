/**
 * The expected outcome is a game that keeps on running.
 */

import {
	DEFAULT_ASSETS,
	DriverI,
	Game,
	blueprints,
	factoryArchetype,
	materials,
	personArchetype,
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

	const factory = factoryArchetype.create({
		location: terrain.getTileClosestToXy(3, 3).$$location.get().toArray(),
		owner: headOfState,
		blueprint: blueprints.beeKeeping,
		maxWorkers: 20,
		maxStackSpace: Infinity,
	});
	await factory.inventory.set(materials.honey, 99);
	game.entities.add(factory);

	for (let i = 0; i < 5; i++) {
		const entity = personArchetype.create({
			location: terrain.getTileClosestToXy(0, 0).$$location.get().toArray(),
			icon: '🤖',
			name: `Test dummy ${i + 1}`,
			behavior: createJobWorkBehavior(),
		});
		await game.entities.add(entity);
	}

	return game;
}

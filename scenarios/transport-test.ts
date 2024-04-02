/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { personArchetype, DriverI } from '@lib';
import { behavior, blueprints, DEFAULT_ASSETS, materials } from '@lib/assets';
import { factoryArchetype, Game, generateGridTerrainFromAscii } from '@lib/core';
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

	const farm = factoryArchetype.create({
		location: terrain.getTileClosestToXy(3, 3).$$location.get().toArray(),
		owner: headOfState,
		blueprint: blueprints.growWheat,
		maxWorkers: 1,
		maxStackSpace: 6,
	});
	await farm.inventory.set(materials.wheat, 99);

	const mill = factoryArchetype.create({
		location: terrain.getTileClosestToXy(8, 3).$$location.get().toArray(),
		owner: headOfState,
		blueprint: blueprints.milling,
		maxWorkers: 1,
		maxStackSpace: 6,
	});

	await game.entities.add(farm, mill);

	for (let i = 0; i < 5; i++) {
		const entity = personArchetype.create({
			location: terrain.getTileClosestToXy(0, 0).$$location.get().toArray(),
			icon: '🤖',
			name: `Test dummy ${i + 1}`,
			behavior: behavior.civilianBehavior,
		});
		await game.entities.add(entity);
	}

	return game;
}

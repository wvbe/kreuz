/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { Game, Random, marketArchetype, generateGridTerrainFromAscii } from '@lib';
import { DEFAULT_ASSETS, behavior, blueprints, materials } from '@lib/assets';
import { headOfState } from '../library/level-2/heroes/heroes.ts';

import { factoryArchetype, DriverI, personArchetype } from '@lib';

export default async function (driver: DriverI) {
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

	const game = new Game(driver, '1', terrain, DEFAULT_ASSETS);
	await driver.attach(game);
	const entity = personArchetype.create({
		location: terrain
			.getTileClosestToXy(
				Math.floor(Random.between(0, 10, 'zfs', 0)),
				Math.floor(Random.between(0, 10, 'zfs', 0 + 'f')),
			)
			.toArray(),
		name: 'Test',
		icon: '🤖',
	});
	await entity.wallet.set(500);

	const marketStall = marketArchetype.create({
		location: terrain.getTileClosestToXy(5, 5).toArray(),
		maxStackSpace: 6,
		materials: [materials.eggs],
		owner: headOfState,
	});
	await marketStall.inventory.change(materials.eggs, 30);

	const factory = factoryArchetype.create({
		location: terrain.getTileClosestToXy(13, 10).toArray(),
		owner: headOfState,
		blueprint: blueprints.beeKeeping,
		maxWorkers: 4,
		maxStackSpace: 8,
	});

	await game.entities.add(entity, marketStall, factory);

	await entity.$behavior.set(behavior.civilianBehavior);

	return { driver, game };
}

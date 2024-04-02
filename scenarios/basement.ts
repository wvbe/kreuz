/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { personArchetype, DriverI } from '@lib';
import { blueprints, DEFAULT_ASSETS } from '@lib/assets';
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

	const entity = personArchetype.create({
		location: terrain.getTileClosestToXy(0, 0).location.get(),
		name: 'Ro-bot',
		icon: '🤖',
		behavior: null,
	});

	entity.needs.hydration.set(0.1);
	await game.entities.add(entity);

	const well = factoryArchetype.create({
		location: terrain.getTileClosestToXy(3, 3).location.get(),
		owner: headOfState,
		blueprint: blueprints.getWaterFromWell,
		maxWorkers: 0,
		maxStackSpace: 1,
	});
	await game.entities.add(well);
	return game;
}

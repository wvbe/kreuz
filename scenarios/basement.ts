/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { blueprints, DEFAULT_ASSETS } from '@lib/assets';
import { FactoryBuildingEntity, Game, generateGridTerrainFromAscii, PersonEntity } from '@lib/core';
import { headOfState } from '../library/level-2/heroes/heroes.ts';
import { DriverI } from '@lib';

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

	const entity = new PersonEntity('1', terrain.getTileClosestToXy(0, 0).toArray(), {
		gender: 'm',
		firstName: 'Melanie',
	});

	entity.needs.find((need) => need.id === 'water')!.set(0.1);
	await game.entities.add(entity);

	const well = new FactoryBuildingEntity(
		'2',
		terrain.getTileClosestToXy(3, 3).toArray(),
		headOfState,
		{
			blueprint: blueprints.getWaterFromWell,
			maxWorkers: 0,
			maxStackSpace: 1,
		},
	);
	await game.entities.add(well);
	return game;
}

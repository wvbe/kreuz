/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import {
	DriverI,
	EcsArchetypeEntity,
	SurfaceType,
	byEcsArchetype,
	personArchetype,
	tileArchetype,
} from '@lib';
import { DEFAULT_ASSETS } from '@lib/assets';
import { Game, generateGridTerrainFromAscii } from '@lib/core';
import { byEcsComponents } from '../library/level-1/ecs/assert.ts';
import { civilianBehavior } from '../library/level-2/behavior.ts';
import { growTerrainForExcavatedEdges } from '../library/level-3/modifiers/growTerrainForExcavatedEdges.ts';

export default async function (driver: DriverI) {
	const game = new Game(driver, '1', DEFAULT_ASSETS);
	game.terrain.tiles.$add.on(growTerrainForExcavatedEdges.bind(game));

	await game.entities.add(
		...generateGridTerrainFromAscii(`
			XXXXXXXXXXXX
			XXXXXXXXXXXX
			XXXXXXXXXXXX
			XXXXXXXXXXXX
			XXXXXXXXXXXX
			XXXXXXXXXXXX
			XXXXXXXXXXXX
		`),
	);
	const entity = personArchetype.create({
		location: game.terrain.getTileClosestToXy(0, 0).location.get(),
		name: 'Ro-bot',
		icon: '🤖',
		behavior: civilianBehavior,
		wealth: 10_000,
	});
	entity.inventory.change(game.assets.materials.get('pickaxe'), 1);
	await game.entities.add(entity);

	return game;
}

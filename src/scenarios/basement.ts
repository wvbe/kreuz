/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { DriverI } from '../lib/level-1/drivers/types';
import { personArchetype } from '../lib/level-1/ecs/archetypes/personArchetype';
import Game from '../lib/level-1/Game';
import { civilianBehavior } from '../lib/level-2/behavior';
import { DEFAULT_ASSETS } from '../lib/level-2/DEFAULT_ASSETS';
import { growTerrainForExcavatedEdges } from '../lib/level-3/modifiers/growTerrainForExcavatedEdges';
import { generateGridTerrainFromAscii } from '../lib/test/generateGridTerrainFromAscii';
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

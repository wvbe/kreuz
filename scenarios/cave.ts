/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import {
	Game,
	DriverI,
	personArchetype,
	growTerrainForExcavatedEdges,
	generateIslandTiles,
	generatePassport,
	DEFAULT_ASSETS,
	Random,
} from '@lib';
import { civilianBehavior } from '../library/level-2/behavior.ts';

export default async function (driver: DriverI) {
	const game = new Game(driver, '1', DEFAULT_ASSETS);

	game.terrain.tiles.$add.on(growTerrainForExcavatedEdges.bind(game));

	await game.entities.add(...generateIslandTiles(['1w25 ""']));

	for (let index = 0; index < 20; index++) {
		const entitySeed = Random.float(`bzt-${index}`);
		const entity = personArchetype.create({
			...generatePassport(['pass', entitySeed]),
			location: Random.fromArray(
				game.terrain.tiles.filter((tile) => tile.walkability > 0),
				`ferge${entitySeed}`,
			).location.get(),
			behavior: civilianBehavior,
			wealth: Random.between(300, 600, `money${entitySeed}`),
		});
		entity.inventory.change(game.assets.materials.get('pickaxe'), 1);
		await game.entities.add(entity);
	}

	return game;
}

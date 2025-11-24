/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { GrassTerrain } from '../game/assets/terrains';
import { ShitRandom } from '../game/core/classes/Random';
import { DriverI } from '../game/core/drivers/types';
import { animalArchetype, AnimalArchetypeType } from '../game/core/ecs/archetypes/animalArchetype';
import {
	RawMaterialType,
	regeneratingRawMaterialArchetype,
} from '../game/core/ecs/archetypes/regeneratingRawMaterialArchetype';
import Game from '../game/core/Game';
import { generateGridTerrainFromAscii } from '../game/test/generateGridTerrainFromAscii';

export default async function (driver: DriverI) {
	const game = new Game(driver, '1');

	const x = 50,
		y = x;
	const tiles = generateGridTerrainFromAscii(`
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
	`);

	await game.terrain.addTiles(tiles);

	const centerIsland = game.terrain.selectContiguousTiles(
		game.terrain.getTileClosestToXy(x / 2, y / 2),
	);

	for (let i = 0; i < 10; i++) {
		await game.entities.add(
			animalArchetype.create({
				location: ShitRandom.fromArray(centerIsland).location.get(),
				name: 'Fien',
				type: AnimalArchetypeType.CHICKEN,
			}),
		);
	}

	await game.entities.add(
		...game.terrain.tiles
			.filter((tile) => tile.surfaceType.get() === GrassTerrain && Math.random() < 0.1)
			.map((tile) => {
				const regeneratingRawMaterial = regeneratingRawMaterialArchetype.create({
					location: tile.location.get(),
					type: RawMaterialType.GRASS,
				});
				return regeneratingRawMaterial;
			}),
	);

	return game;
}

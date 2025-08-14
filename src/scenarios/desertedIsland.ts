/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { civilianBehavior } from '../game/assets/behavior/trees/civilianBehavior';
import { GrassTerrain } from '../game/assets/terrains';
import { ShitRandom } from '../game/core/classes/Random';
import { DriverI } from '../game/core/drivers/types';
import { animalArchetype, AnimalArchetypeType } from '../game/core/ecs/archetypes/animalArchetype';
import { personArchetype } from '../game/core/ecs/archetypes/personArchetype';
import { portalArchetype } from '../game/core/ecs/archetypes/portalArchetype';
import {
	RawMaterialType,
	regeneratingRawMaterialArchetype,
} from '../game/core/ecs/archetypes/regeneratingRawMaterialArchetype';
import Game from '../game/core/Game';
import { generateIsland, getIslandTileInfos } from '../game/generators/generateIsland';
import { generateGridTerrainFromAscii } from '../game/test/generateGridTerrainFromAscii';

export default async function (driver: DriverI) {
	const game = new Game(driver, '1');

	const x = 50,
		y = x;
	// const tiles = generateGridTerrainFromAscii(`
	// 	XXXXXXXXXXXX
	// 	XXXXXXXXXXXX
	// 	XXXXXXXXXXXX
	// 	XXXXXXXXXXXX
	// 	XXXXXXXXXXXX
	// 	XXXXXXXXXXXX
	// 	XXXXXXXXXXXX
	// `);

	const tiles = getIslandTileInfos(
		generateIsland({
			width: x,
			height: y,
			waterlineZ: -1,
			seed: Math.random() * 10000,
		}),
	);

	await game.terrain.addTiles(tiles);

	const centerIsland = game.terrain.selectContiguousTiles(
		game.terrain.getTileClosestToXy(x / 2, y / 2),
	);

	for (let i = Math.round(x / 2); i < 6; i++) {
		const randomTile = ShitRandom.fromArray(centerIsland);
		const regeneratingRawMaterial = regeneratingRawMaterialArchetype.create({
			location: randomTile.location.get(),
			type: RawMaterialType.PINEWOOD,
		});
		await game.entities.add(regeneratingRawMaterial);
	}

	const entity = personArchetype.create({
		location: ShitRandom.fromArray(centerIsland).location.get(),
		name: 'Rowbot',
		icon: '🤖',
		behavior: civilianBehavior,
		wealth: 10_000,
		immortal: true,
	});
	await game.entities.add(entity);

	await game.entities.add(
		animalArchetype.create({
			location: ShitRandom.fromArray(centerIsland).location.get(),
			name: 'Good Boy',
			type: AnimalArchetypeType.DOG,
		}),
	);

	await game.entities.add(
		animalArchetype.create({
			location: ShitRandom.fromArray(centerIsland).location.get(),
			name: 'Fien',
			type: AnimalArchetypeType.CHICKEN,
		}),
	);

	await game.entities.add(
		animalArchetype.create({
			location: ShitRandom.fromArray(centerIsland).location.get(),
			name: 'Siep',
			type: AnimalArchetypeType.CHICKEN,
		}),
	);

	await game.entities.add(
		animalArchetype.create({
			location: ShitRandom.fromArray(centerIsland).location.get(),
			name: 'Bella',
			type: AnimalArchetypeType.COW,
		}),
	);

	const portal = portalArchetype.create({
		location: ShitRandom.fromArray(centerIsland).location.get(),
		name: 'Portal to another place',
		tiles: generateGridTerrainFromAscii(`
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			---------------X--`),
		portalEnd: [15, 9, 0],
	});
	await game.entities.add(portal);

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

	const portalBack = portalArchetype.create({
		name: 'Portal to another place',
		reverseOfPortalEntity: portal,
	});
	await game.entities.add(portalBack);
	return game;
}

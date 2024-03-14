/**
 * The expected outcome is a game that keeps on running.
 */

import {
	DEFAULT_ASSETS,
	DriverI,
	EcsEntity,
	Game,
	Random,
	behavior,
	blueprints,
	marketArchetype,
	personArchetype,
	inventoryComponent,
	materials,
	factoryArchetype,
} from '@lib';
import { headOfState } from '../library/level-2/heroes/heroes.ts';
import { generateDualMeshTerrain } from '../library/level-3/utils/generateDualMeshTerrain.ts';
import { generatePassport } from '../library/level-3/utils/generatePassport.ts';
import { EcsArchetypeEntity } from '../library/level-1/ecs/types.ts';

const TOOLS = [materials.axe, materials.hammer, materials.pickaxe, materials.woodsaw];

const FOODS = Object.values(materials).filter(
	(material) => material.nutrition > 0 && !material.toxicity,
);

async function generateRandomInventories(game: Game) {
	const possibleRandomTools = [...TOOLS, null, null, null];
	const possibleRandomFoods = [...FOODS, null, null, null];
	await Promise.all(
		game.entities
			.filter<EcsArchetypeEntity<typeof personArchetype>>((entity) => personArchetype.test(entity))
			.map(async (entity, i) => {
				const randomTool = Random.fromArray(possibleRandomTools, entity.id, 'free-tool', i);
				if (randomTool) {
					await entity.inventory.set(randomTool, 1);
				}
				const randomFood = Random.fromArray(possibleRandomFoods, entity.id, 'free-food', i);
				if (randomFood) {
					await entity.inventory.set(
						randomFood,
						Math.floor(Random.between(1, 5, entity.id, 'free-food-quantity', i)),
					);
				}
			}),
	);
}

export async function generateEntities(game: Game) {
	const walkableTiles = game.terrain.tiles.filter((c) => c.isLand());
	if (!walkableTiles.length) {
		throw new Error('The terrain does not contain any walkable tiles!');
	}

	for (let i = 0; i < Random.between(100, 200, game.seed, 'guardamount'); i++) {
		const id = `${game.seed}-person-${i}`;
		const person = personArchetype.create({
			location: Random.fromArray(walkableTiles, id).toArray(),
			...generatePassport([id]),
		});
		await person.wallet.set(Random.between(20, 500, id, 'munnie'));
		await game.entities.add(person);
		await person.$behavior.set(behavior.civilianBehavior);
	}

	for (let i = 0; i < Random.between(24, 32, game.seed, 'factories'); i++) {
		const id = `${game.seed}-factory-${i}`;
		const tile = Random.fromArray(walkableTiles, id);
		const blueprint = Random.fromArray(Object.values(blueprints), id, 'blueprint');
		const factory = factoryArchetype.create({
			location: tile.toArray(),
			owner: headOfState,
			blueprint,
			maxWorkers: 3 * blueprint.options.workersRequired,
			maxStackSpace: 8,
			name: blueprint.options.buildingName,
			icon: blueprint.products[0].material.symbol,
		});
		await Promise.all(
			blueprint.ingredients.map(async ({ material }) => {
				await factory.inventory.set(
					material,
					Math.round(material.stack * Random.between(0.2, 1, id)),
				);
			}),
		);
		await Promise.all([
			...blueprint.products.map(async ({ material }) => {
				await factory.inventory.set(
					material,
					Math.round(material.stack * Random.between(0.2, 1, id)),
				);
			}),
			game.entities.add(factory),
		]);
		walkableTiles.splice(walkableTiles.indexOf(tile), 1);
	}

	for (let i = 0; i < Random.between(10, 15, game.seed, 'market-stalls'); i++) {
		const id = `${game.seed}-market-stall-${i}`;
		const tile = Random.fromArray(walkableTiles, id);
		const material = Random.fromArray(FOODS, id, '-mat');
		const market = marketArchetype.create({
			location: tile.toArray(),
			materials: [material],
			owner: headOfState,
			maxStackSpace: 6,
			name: `${material.label} stall`,
			icon: material.symbol,
		});
		await market.inventory.set(material, Math.round(material.stack * Random.between(1, 4, id)));
		await game.entities.add(market);
		walkableTiles.splice(walkableTiles.indexOf(tile), 1);
	}
}

export default async function (driver: DriverI) {
	const game = new Game(driver, 1, generateDualMeshTerrain(1, 40, 1), DEFAULT_ASSETS);
	await generateEntities(game);
	await generateRandomInventories(game);
	return game;
}

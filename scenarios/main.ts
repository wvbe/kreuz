/**
 * The expected outcome is a game that keeps on running.
 */

import {
	ChurchBuildingEntity,
	DEFAULT_ASSETS,
	FactoryBuildingEntity,
	Game,
	MarketBuildingEntity,
	PersonEntity,
	Random,
	SettlementEntity,
	behavior,
	blueprints,
	materials,
} from '@lib';
import { headOfState } from '../library/level-2/heroes/heroes.ts';
import { generateDualMeshTerrain } from '../library/level-3/utils/generateDualMeshTerrain.ts';
import { generatePassport } from '../library/level-3/utils/generatePassport.ts';
import { generateSettlementName } from '../library/level-3/utils/generateSettlementName.ts';
import { DriverI } from '@lib';

const TOOLS = [materials.axe, materials.hammer, materials.pickaxe, materials.woodsaw];

const FOODS = Object.values(materials).filter(
	(material) => material.nutrition > 0 && !material.toxicity,
);

async function generateRandomInventories(game: Game) {
	const possibleRandomTools = [...TOOLS, null, null, null];
	const possibleRandomFoods = [...FOODS, null, null, null];
	await Promise.all(
		game.entities
			.filter<PersonEntity>((e) => e instanceof PersonEntity)
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

	for (let i = 0; i < Random.between(36, 54, game.seed, 'guardamount'); i++) {
		const id = `${game.seed}-person-${i}`;
		const person = new PersonEntity(
			id,
			Random.fromArray(walkableTiles, id).toArray(),
			generatePassport([id]),
		);
		await person.wallet.set(Random.between(20, 500, id, 'munnie'));
		await game.entities.add(person);
		await person.$behavior.set(behavior.civilianBehavior);
	}

	for (let i = 0; i < Random.between(3, 6, game.seed, 'settlements'); i++) {
		const id = `${game.seed}-settlement-${i}`;
		const tile = Random.fromArray(walkableTiles, id);
		await game.entities.add(
			new SettlementEntity(id, tile.toArray(), {
				name: generateSettlementName([id]),
				areaSize: Random.between(0.3, 0.6, game.seed, 'setsize', i),
				minimumBuildingLength: 0.2,
				scale: 0.5,
			}),
		);
		walkableTiles.splice(walkableTiles.indexOf(tile), 1);
	}

	for (let i = 0; i < Random.between(24, 32, game.seed, 'factories'); i++) {
		const id = `${game.seed}-factory-${i}`;
		const tile = Random.fromArray(walkableTiles, id);
		const blueprint = Random.fromArray(Object.values(blueprints), id, 'blueprint');
		const factory = new FactoryBuildingEntity(id, tile.toArray(), headOfState, {
			blueprint,
			maxWorkers: 3 * blueprint.options.workersRequired,
			maxStackSpace: 8,
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
		const market = new MarketBuildingEntity(id, tile.toArray(), material, headOfState);
		await market.inventory.set(material, Math.round(material.stack * Random.between(1, 4, id)));
		await game.entities.add(market);
		walkableTiles.splice(walkableTiles.indexOf(tile), 1);
	}

	for (let i = 0; i < Random.between(2, 4, game.seed, 'churches'); i++) {
		const id = `${game.seed}-church-${i}`;
		const tile = Random.fromArray(walkableTiles, id);
		await game.entities.add(new ChurchBuildingEntity(id, tile.toArray()));
		walkableTiles.splice(walkableTiles.indexOf(tile), 1);
	}
}

export default async function (driver: DriverI) {
	const game = new Game(driver, 1, generateDualMeshTerrain(1, 40, 1), DEFAULT_ASSETS);
	await generateEntities(game);
	await generateRandomInventories(game);
	return game;
}

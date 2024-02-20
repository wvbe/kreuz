/**
 * The expected outcome is a game that keeps on running.
 */

import {
	ChurchBuildingEntity,
	FactoryBuildingEntity,
	Game,
	MarketBuildingEntity,
	PersonEntity,
	Random,
	SettlementEntity,
} from '../level-1/mod.ts';
import { headOfState } from '../level-2/heroes.ts';
import {
	DEFAULT_ASSETS,
	FIRST_NAMES_F,
	FIRST_NAMES_M,
	behavior,
	blueprints,
	materials,
	getRandomSettlementName,
} from '../level-2/mod.ts';
import { Demo } from './types.ts';
import { generateDualMeshTerrain } from './utils/generateDualMeshTerrain.ts';

const TOOLS = [materials.axe, materials.hammer, materials.pickaxe, materials.woodsaw];

const FOODS = Object.values(materials).filter(
	(material) => material.nutrition > 0 && !material.toxicity,
);

function generateRandomInventories(game: Game) {
	const possibleRandomTools = [...TOOLS, null, null, null];
	const possibleRandomFoods = [...FOODS, null, null, null];
	game.entities
		.filter<PersonEntity>((e) => e instanceof PersonEntity)
		.forEach((entity, i) => {
			const randomTool = Random.fromArray(possibleRandomTools, entity.id, 'free-tool', i);
			if (randomTool) {
				entity.inventory.set(randomTool, 1);
			}
			const randomFood = Random.fromArray(possibleRandomFoods, entity.id, 'free-food', i);
			if (randomFood) {
				entity.inventory.set(
					randomFood,
					Math.floor(Random.between(1, 5, entity.id, 'free-food-quantity', i)),
				);
			}
		});
}

export function generateEntities(game: Game) {
	const walkableTiles = game.terrain.tiles.filter((c) => c.isLand());
	if (!walkableTiles.length) {
		throw new Error('The terrain does not contain any walkable tiles!');
	}

	for (let i = 0; i < Random.between(36, 54, game.seed, 'guardamount'); i++) {
		const id = `${game.seed}-person-${i}`;
		const gender = Random.boolean([id, 'gender'], 0.5) ? 'm' : 'f';
		const firstName = Random.fromArray(
			gender === 'm' ? FIRST_NAMES_M : FIRST_NAMES_F,
			id,
			'gender',
		);
		const person = new PersonEntity(id, Random.fromArray(walkableTiles, id).toArray(), {
			gender,
			firstName,
		});
		person.wallet.set(Random.between(20, 500, id, 'munnie'));
		game.entities.add(person);

		person.$behavior.set(behavior.civvyBehavior);
	}

	for (let i = 0; i < Random.between(3, 6, game.seed, 'settlements'); i++) {
		const id = `${game.seed}-settlement-${i}`;
		const tile = Random.fromArray(walkableTiles, id);
		game.entities.add(
			new SettlementEntity(id, tile.toArray(), {
				name: getRandomSettlementName([id]),
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
		blueprint.ingredients.forEach(({ material }) =>
			factory.inventory.set(material, Math.round(material.stack * Random.between(0.2, 1, id))),
		);
		blueprint.products.forEach(({ material }) =>
			factory.inventory.set(material, Math.round(material.stack * Random.between(0.2, 1, id))),
		);
		game.entities.add(factory);
		walkableTiles.splice(walkableTiles.indexOf(tile), 1);
	}

	for (let i = 0; i < Random.between(10, 15, game.seed, 'market-stalls'); i++) {
		const id = `${game.seed}-market-stall-${i}`;
		const tile = Random.fromArray(walkableTiles, id);
		const material = Random.fromArray(FOODS, id, '-mat');
		const market = new MarketBuildingEntity(id, tile.toArray(), material, headOfState);
		market.inventory.set(material, Math.round(material.stack * Random.between(1, 4, id)));
		game.entities.add(market);
		walkableTiles.splice(walkableTiles.indexOf(tile), 1);
	}

	for (let i = 0; i < Random.between(2, 4, game.seed, 'churches'); i++) {
		const id = `${game.seed}-church-${i}`;
		const tile = Random.fromArray(walkableTiles, id);
		game.entities.add(new ChurchBuildingEntity(id, tile.toArray()));
		walkableTiles.splice(walkableTiles.indexOf(tile), 1);
	}
}

const demo: Demo = (driver) => {
	const game = new Game(1, generateDualMeshTerrain(1, 40, 1), DEFAULT_ASSETS);
	driver.attach(game);

	generateEntities(game);
	generateRandomInventories(game);

	return { driver, game };
};

export default demo;

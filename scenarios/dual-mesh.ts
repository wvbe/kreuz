/**
 * The expected outcome is a game that keeps on running.
 */

import {
	DEFAULT_ASSETS,
	DriverI,
	EcsArchetypeEntity,
	Game,
	Random,
	behavior,
	behaviorComponent,
	blueprints,
	createFactoryForBlueprint,
	createMarketForMaterial,
	eventLogComponent,
	healthComponent,
	locationComponent,
	pathingComponent,
	personArchetype,
	visibilityComponent,
} from '@lib';
import { headOfState } from '../library/level-2/heroes/heroes.ts';
import { generateDualMeshTiles } from '../library/level-3/generators/generateDualMeshTiles.ts';
import { generatePassport } from '../library/level-3/generators/generatePassport.ts';

const TOOLS = [
	DEFAULT_ASSETS.materials.get('axe'),
	DEFAULT_ASSETS.materials.get('hammer'),
	DEFAULT_ASSETS.materials.get('pickaxe'),
	DEFAULT_ASSETS.materials.get('woodsaw'),
];

const FOODS = DEFAULT_ASSETS.materials
	.toArray()
	.filter((material) => (material.nutrition > 0 || material.hydration > 0) && !material.toxicity);

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
	const walkableTiles = game.terrain.tiles.filter((tile) => tile.walkability > 0);
	if (!walkableTiles.length) {
		throw new Error('The terrain does not contain any walkable tiles!');
	}

	const dog = { id: 'dog' };
	visibilityComponent.attach(dog, { name: 'Archibald', icon: '🐶' });
	locationComponent.attach(dog, {
		location: Random.fromArray(walkableTiles, 'dog').location.get(),
	});
	pathingComponent.attach(dog, { walkSpeed: 0.1 });
	eventLogComponent.attach(dog, {});
	healthComponent.attach(dog, { health: 1 });
	behaviorComponent.attach(dog, { behavior: behavior.civilianBehavior });
	game.entities.add(dog);

	for (let i = 0; i < Random.between(24, 32, game.seed, 'factories'); i++) {
		const id = `${game.seed}-factory-${i}`;
		const tile = Random.fromArray(walkableTiles, id);
		const blueprint = Random.fromArray(Object.values(blueprints), id, 'blueprint');

		const factory = await createFactoryForBlueprint(blueprint, headOfState, tile.location.get());
		await game.entities.add(factory);
		walkableTiles.splice(walkableTiles.indexOf(tile), 1);
	}

	for (let i = 0; i < Random.between(10, 15, game.seed, 'market-stalls'); i++) {
		const id = `${game.seed}-market-stall-${i}`;
		const tile = Random.fromArray(walkableTiles, id);
		const material = Random.fromArray(FOODS, id, '-mat');
		const market = await createMarketForMaterial(material, headOfState, tile.location.get());
		await game.entities.add(market);
		walkableTiles.splice(walkableTiles.indexOf(tile), 1);
	}

	for (let i = 0; i < Random.between(160, 240, game.seed, 'guardamount'); i++) {
		const id = `${game.seed}-person-${i}`;
		const person = personArchetype.create({
			location: Random.fromArray(walkableTiles, id).location.get(),
			...generatePassport([id]),
			behavior: behavior.civilianBehavior,
			wealth: Random.between(20, 500, id, 'munnie'),
		});
		await game.entities.add(person);
	}
}

export default async function (driver: DriverI) {
	const game = new Game(driver, 1, DEFAULT_ASSETS);
	await game.entities.add(...generateDualMeshTiles(1, 40, 1));
	await generateEntities(game);
	await generateRandomInventories(game);
	return game;
}

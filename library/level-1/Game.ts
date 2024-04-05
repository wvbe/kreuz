import { type DEFAULT_ASSETS } from '../level-2/DEFAULT_ASSETS.ts';
import { Command } from './classes/Command.ts';
import { JobBoard } from './classes/JobBoard.ts';
import { Prompt } from './classes/Prompt.ts';
import { type StrictMap } from './classes/StrictMap.ts';
import { TimeLine } from './classes/TimeLine.ts';
import { type DriverI } from './drivers/types.ts';
import { type EcsArchetype } from './ecs/classes/EcsArchetype.ts';
import { type EcsComponent } from './ecs/classes/EcsComponent.ts';
import { type EcsSystem } from './ecs/classes/EcsSystem.ts';
import {
	type BehaviorTreeNodeI,
	type EntityBlackboard,
} from './ecs/components/behaviorComponent/types.ts';
import { locationComponent } from './ecs/components/locationComponent.ts';
import { outlineComponent } from './ecs/components/outlineComponent.ts';
import { pathableComponent } from './ecs/components/pathableComponent.ts';
import { type Blueprint } from './ecs/components/productionComponent/Blueprint.ts';
import { behaviorTreeSystem } from './ecs/systems/behaviorTreeSystem.ts';
import { grocerySystem } from './ecs/systems/grocerySystem.ts';
import { healthSystem } from './ecs/systems/healthSystem.ts';
import { logisticsSystem } from './ecs/systems/logisticsSystem.ts';
import { productionSystem } from './ecs/systems/productionSystem.ts';
import { selfsustainingSystem } from './ecs/systems/selfsustainingSystem.ts';
import { type EcsEntity } from './ecs/types.ts';
import { Collection } from './events/Collection.ts';
import { KeyedCollection } from './events/KeyedCollection.ts';
import { CollectionBucket } from './events/CollectionBucket.ts';
import { type Material } from './inventory/Material.ts';
import { type TerrainI } from './terrain/types.ts';
import { type SavedGameJson } from './types-savedgame.ts';
import { type SeedI } from './types.ts';
import { personArchetype } from './ecs/archetypes/personArchetype.ts';
import { factoryArchetype } from './ecs/archetypes/factoryArchetype.ts';
import { marketArchetype } from './ecs/archetypes/marketArchetype.ts';
import { tileArchetype } from './ecs/archetypes/tileArchetype.ts';
import { EcsArchetypeEntity, Terrain } from '@lib/core';

export type GameAssets = {
	behaviorNodes: StrictMap<BehaviorTreeNodeI<EntityBlackboard>>;
	materials: StrictMap<Material>;
	blueprints: StrictMap<Blueprint>;
	commands: StrictMap<Command<EntityBlackboard>>;
};

function createEntitiesCollections() {
	const entities = new KeyedCollection<'id', EcsEntity>('id');
	return Object.assign(entities, {
		living: new CollectionBucket(
			entities,
			(
				entity,
			): entity is EcsArchetypeEntity<
				typeof personArchetype | typeof factoryArchetype | typeof marketArchetype
			> =>
				personArchetype.test(entity) ||
				factoryArchetype.test(entity) ||
				marketArchetype.test(entity),
		),
	});
}
/**
 * Represents one game world, where entities interact with eachother and things around them.
 *
 * - Uses an {@link EcsEntity entity}-{@link EcsComponent component}-{@link EcsSystem system} architecture for most interactive things.
 * - Uses {@link Blueprint}s and {@link Material} to create somewhat of an economy.
 */
export default class Game {
	/**
	 * An unsorted list of all ECS entities in the game. For most uses, you'll probably want to
	 * {@link KeyedCollection.filter} this list and use {@link EcsComponent.test} or {@link EcsArchetype.test}
	 * methods select the entities you're interested in.
	 */
	public readonly entities = createEntitiesCollections();

	/**
	 * The global understanding of the passage of time. Has some helper methods such as {@link TimeLine.setTimeout}
	 * and {@link TimeLine.wait} to link game events to time passed. Has other methods ({@link TimeLine.step},
	 * {@link TimeLine.steps} or {@link TimeLine.jump}) to move time forward.
	 *
	 * A {@link DriverI} is responsible for linking the passage of time to animation frames or other.
	 *
	 * We pretend that a thousand "time" is "one hour". The current time is always {@link TimeLine.now}.
	 */
	public readonly time = new TimeLine();

	/**
	 * The global jobboard, where capable entities can find a new activity to do. Jobs may be posted
	 * by external code, for example an ECS system like {@link productionSystem} or {@link logisticsSystem}.
	 */
	public readonly jobs = new JobBoard();

	/**
	 * A {@link DriverI} is responsible for linking the game to an environment such as a browser or CLI.
	 * The driver, amongst other things, can determine when to move game time forward and sync it with
	 * animation.
	 */
	public readonly driver: DriverI;

	/**
	 * The geography in which all game events supposedly take place. A magical land.
	 */
	public readonly terrain: TerrainI<EcsArchetypeEntity<typeof tileArchetype>>;

	/**
	 * A seed number or string to help create semi-random things.
	 */
	public readonly seed: SeedI;

	/**
	 * Things of various types that systems within the game have access to. For example, contains the
	 * {@link Material}s and {@link Blueprint}s that the game knows about, ie. which crafting recipes
	 * and outcomes are possible.
	 *
	 * All these things are pluggable, but in most games and tests the preset {@link DEFAULT_ASSETS}
	 * is used, because it is sane and diverse.
	 *
	 * See {@link GameAssets}.
	 */
	public readonly assets: GameAssets;

	public readonly commands = new Collection<Command<EntityBlackboard>>();

	constructor(driver: DriverI, seed: SeedI, assets: GameAssets) {
		this.driver = driver;

		this.seed = seed;

		this.terrain = new Terrain<EcsArchetypeEntity<typeof tileArchetype>>(
			new CollectionBucket(this.entities, tileArchetype.test.bind(tileArchetype)),
		);
		this.assets = assets;

		productionSystem.attachGame(this);
		behaviorTreeSystem.attachGame(this);
		healthSystem.attachGame(this);
		logisticsSystem.attachGame(this);
		selfsustainingSystem.attachGame(this);
		grocerySystem.attachGame(this);

		driver.attach(this);
	}

	/**
	 * Serialize for a save game JSON
	 *
	 * @todo re-enable JSON-seriazing ECS entities, or rather, their components.
	 */
	public toSaveJson(): SavedGameJson {
		return {
			version: 'alpha', // todo version some time,
			// terrain: this.terrain.toSaveJson(),
			// entities: this.entities.map((entity) =>
			// 	entity.toSaveJson(this.assets),
			// ) as SavedGameJson['entities'],
			time: this.time.toSaveJson(this.assets),
			seed: this.seed,
		};
	}

	/**
	 * Deserialize a JSON into a live {@link Game} instance.
	 *
	 * @todo re-enable JSON-deseriazing ECS entities, or rather, their components.
	 */
	// public static async fromSaveJson(
	// 	driver: DriverI,
	// 	assets: GameAssets,
	// 	save: SavedGameJson,
	// ): Promise<Game> {
	// 	const game = new Game(driver, save.seed, Terrain.fromSaveJson(save.terrain), assets);
	// 	// await game.entities.add(
	// 	// 	...(await Promise.all(save.entities.map((entity) => castSaveJsonToEntity(assets, entity)))),
	// 	// );
	// 	return game;
	// }

	public prompt<ReturnGeneric extends { [key: string]: any }>(
		id: Prompt<ReturnGeneric>,
	): Promise<ReturnGeneric> {
		return new Promise<ReturnGeneric>((resolve, reject) => {
			this.driver.$prompt.emit({ id, resolve, reject });
		});
	}
}

import { EcsArchetypeEntity, Terrain } from '@lib/core';
import { type DEFAULT_ASSETS } from '../level-2/DEFAULT_ASSETS.ts';
import { Command } from './classes/Command.ts';
import { JobBoard } from './classes/JobBoard.ts';
import { Prompt } from './classes/Prompt.ts';
import { type StrictMap } from './classes/StrictMap.ts';
import { type DriverI } from './drivers/types.ts';
import { tileArchetype } from './ecs/archetypes/tileArchetype.ts';
import { type EcsArchetype } from './ecs/classes/EcsArchetype.ts';
import { type EcsComponent } from './ecs/classes/EcsComponent.ts';
import { type EcsSystem } from './ecs/classes/EcsSystem.ts';
import {
	type BehaviorTreeNodeI,
	type EntityBlackboard,
} from './ecs/components/behaviorComponent/types.ts';
import { type Blueprint } from './ecs/components/productionComponent/Blueprint.ts';
import { behaviorTreeSystem } from './ecs/systems/behaviorTreeSystem.ts';
import { grocerySystem } from './ecs/systems/grocerySystem.ts';
import { healthSystem } from './ecs/systems/healthSystem.ts';
import { logisticsSystem } from './ecs/systems/logisticsSystem.ts';
import { productionSystem } from './ecs/systems/productionSystem.ts';
import { selfsustainingSystem } from './ecs/systems/selfsustainingSystem.ts';
import { type EcsEntity } from './ecs/types.ts';
import { Collection } from './events/Collection.ts';
import { CollectionBucket } from './events/CollectionBucket.ts';
import { KeyedCollection } from './events/KeyedCollection.ts';
import { type Material } from './inventory/Material.ts';
import { type TerrainI } from './terrain/types.ts';
import { Time } from './time/Time.ts';
import { type timeToString } from './time/timeToString.ts';
import { type SavedGameJson } from './types-savedgame.ts';
import { type SeedI } from './types.ts';

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
			(entity): entity is EcsEntity => !tileArchetype.test(entity),
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
	 * The global understanding of the passage of time. Has some helper methods such as {@link Time.setTimeout}
	 * and {@link Time.wait} to link game events to time passed. Has other methods ({@link Time.step},
	 * {@link Time.steps} or {@link Time.jump}) to move time forward.
	 *
	 * A {@link DriverI} is responsible for linking the passage of time to animation frames or other.
	 *
	 * We pretend that one time is one real-world second. According to {@link timeToString}, there are;
	 * - 60 seconds in a minute
	 * - 60 minutes in an hour
	 * - 24 hours in a day
	 * - 30 days in a month
	 * - 12 months in a year
	 */
	public readonly time = new Time();

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
		this.seed = seed;
		this.assets = assets;
		this.driver = driver;
		this.terrain = new Terrain<EcsArchetypeEntity<typeof tileArchetype>>(
			new CollectionBucket(this.entities, tileArchetype.test.bind(tileArchetype)),
		);


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

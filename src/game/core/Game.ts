import { JobBoard } from './classes/JobBoard';
import { type DriverI } from './drivers/types';
import { type EcsArchetype } from './ecs/classes/EcsArchetype';
import { type EcsComponent } from './ecs/classes/EcsComponent';
import { type EcsSystem } from './ecs/classes/EcsSystem';
import { type Blueprint } from './ecs/components/productionComponent/Blueprint';
import { behaviorTreeSystem } from './ecs/systems/behaviorTreeSystem';
import { grocerySystem } from './ecs/systems/grocerySystem';
import { healthSystem } from './ecs/systems/healthSystem';
import { logisticsSystem } from './ecs/systems/logisticsSystem';
import { productionSystem } from './ecs/systems/productionSystem';
import { selfsustainingSystem } from './ecs/systems/selfsustainingSystem';
import { type EcsEntity } from './ecs/types';
import { KeyedCollection } from './events/KeyedCollection';
import { type Material } from './inventory/Material';
import { Terrain } from './terrain/Terrain';
import { Time } from './time/Time';
import { type timeToString } from './time/timeToString';
import { type SeedI } from './types';

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
	public readonly entities = new KeyedCollection<'id', EcsEntity>('id');

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
	public readonly jobs = new JobBoard(this);

	/**
	 * The geography in which all game events supposedly take place. A magical land.
	 */
	public readonly terrain = new Terrain({
		id: 'world-surface',
	});

	constructor(
		/**
		 * A {@link DriverI} is responsible for linking the game to an environment such as a browser or CLI.
		 * The driver, amongst other things, can determine when to move game time forward and sync it with
		 * animation.
		 */
		public readonly driver: DriverI,
		/**
		 * A seed number or string to help create semi-random things.
		 */
		public readonly seed: SeedI,
	) {
		productionSystem.attachGame(this);
		behaviorTreeSystem.attachGame(this);
		healthSystem.attachGame(this);
		logisticsSystem.attachGame(this);
		selfsustainingSystem.attachGame(this);
		grocerySystem.attachGame(this);

		driver.attach(this);
	}
}

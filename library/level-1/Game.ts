import { JobVacancy } from './behavior/JobVacancy.ts';
import { EntityBlackboard } from './behavior/types.ts';
import { Collection } from './events/Collection.ts';
import { Event } from './events/Event.ts';
import { KeyedCollection } from './events/KeyedCollection.ts';
import { Registry } from './classes/Registry.ts';
import { TimeLine } from './classes/TimeLine.ts';
import { castSaveJsonToEntity } from './entities/castSaveJsonToEntity.ts';
import { EntityI } from './entities/types.ts';
import { Blueprint } from './inventory/Blueprint.ts';
import { Material } from './inventory/Material.ts';
import { BehaviorTreeNodeI } from './mod.ts';
import { Terrain } from './terrain/Terrain.ts';
import { SavedGameJson } from './types-savedgame.ts';
import { SeedI } from './types.ts';
import { DriverI } from './drivers/types.ts';
import * as blueprintProduction from './systems/blueprintProduction.ts';
import * as behaviorTree from './systems/behaviorTree.ts';
import * as healthSystem from './systems/healthSystem.ts';

export type GameAssets = {
	behaviorNodes: Registry<BehaviorTreeNodeI<EntityBlackboard>>;
	materials: Registry<Material>;
	blueprints: Registry<Blueprint>;
};
export default class Game {
	public readonly terrain: Terrain;

	public readonly entities = new KeyedCollection<'id', EntityI>('id');

	public readonly time = new TimeLine();

	public readonly seed: SeedI;

	public readonly assets: GameAssets;

	public readonly jobs = new Collection<JobVacancy>();

	/*
	 * EVENTS
	 */

	public readonly $resume = new Event('Game $resume');

	public readonly $pause = new Event('Game $pause');

	/*
	 * EVENTED VALUES
	 */

	constructor(driver: DriverI, seed: SeedI, terrain: Terrain, assets: GameAssets) {
		this.seed = seed;
		this.terrain = terrain;
		this.assets = assets;

		this.entities.$change.on(async (added, removed) => {
			for (const entity of added) {
				await entity.attach(this);
			}
			for (const entity of removed) {
				await entity.detach();
			}
		});
		// @TODO no need to perform attachSystem in $attach, because `game` is not required?
		behaviorTree.attachSystem(this);
		blueprintProduction.attachSystem(this);
		healthSystem.attachSystem(this);
		driver.attach(this);
	}

	/**
	 * Announces to all those who listen (but want to remain agnostic of the driver) that the
	 * game has started. This usually coincides with a render loop etc. being handled by the
	 * driver.
	 *
	 * Normally called by the driver, or from a unit test.
	 */
	public async start() {
		await this.$resume.emit();
	}

	public async stop() {
		await this.$pause.emit();
	}

	/**
	 * Serialize for a save game JSON
	 */
	public toSaveJson(): SavedGameJson {
		return {
			version: 'alpha', // todo version some time,
			terrain: this.terrain.toSaveJson(),
			entities: this.entities.map((entity) =>
				entity.toSaveJson(this.assets),
			) as SavedGameJson['entities'],
			time: this.time.toSaveJson(this.assets),
			seed: this.seed,
		};
	}
	public static async fromSaveJson(
		driver: DriverI,
		assets: GameAssets,
		save: SavedGameJson,
	): Promise<Game> {
		const game = new Game(driver, save.seed, Terrain.fromSaveJson(save.terrain), assets);
		await game.entities.add(
			...(await Promise.all(save.entities.map((entity) => castSaveJsonToEntity(assets, entity)))),
		);
		return game;
	}
}

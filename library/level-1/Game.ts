import { KeyedCollection } from './classes/KeyedCollection.ts';
import { Event } from './classes/Event.ts';
import { TimeLine } from './classes/TimeLine.ts';
import { EntityI } from './entities/types.ts';
import { Terrain } from './terrain/Terrain.ts';
import { SavedGameJson, SaveJsonContext } from './types-savedgame.ts';
import { SeedI } from './types.ts';
import { castSaveJsonToEntity } from './entities/castSaveJsonToEntity.ts';
import { Registry } from './classes/Registry.ts';
import { BehaviorTreeNodeI } from './mod.ts';
import { EntityBlackboard } from './behavior/types.ts';

export type GameAssets = {
	behaviorNodes: Registry<BehaviorTreeNodeI<EntityBlackboard>>;
};
export default class Game {
	public readonly terrain: Terrain;

	public readonly entities = new KeyedCollection<'id', EntityI>('id');

	public readonly time = new TimeLine();

	public readonly seed: SeedI;

	public readonly assets: GameAssets;

	/*
	 * EVENTS
	 */

	public readonly $resume = new Event('Game $resume');

	public readonly $pause = new Event('Game $pause');

	/*
	 * EVENTED VALUES
	 */

	constructor(seed: SeedI, terrain: Terrain, assets: GameAssets) {
		this.seed = seed;
		this.terrain = terrain;

		this.entities.$add.on((added) =>
			added.forEach((entity) => {
				entity.attach(this);
			}),
		);

		this.assets = assets;

		this.entities.$remove.on((removed) =>
			removed.forEach((entity) => {
				entity.detach();
			}),
		);
	}

	/**
	 * Announces to all those who listen (but want to remain agnostic of the driver) that the
	 * game has started. This usually coincides with a render loop etc. being handled by the
	 * driver.
	 *
	 * Normally called by the driver, or from a unit test.
	 */
	public start() {
		this.$resume.emit();
	}

	public stop() {
		this.$pause.emit();
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
	public static fromSaveJson(assets: GameAssets, save: SavedGameJson): Game {
		const game = new Game(save.seed, Terrain.fromSaveJson(save.terrain), assets);
		game.entities.add(...save.entities.map((entity) => castSaveJsonToEntity(assets, entity)));
		return game;
	}
}

import { Event } from './classes/Event.ts';
import { TimeLine } from './classes/TimeLine.ts';
import { Collection } from './classes/Collection.ts';
import { EntityI } from './entities/types.ts';
import { SavedGameJson } from './types-savedgame.ts';
import { SeedI, TerrainI } from './types.ts';

export default class Game {
	public readonly terrain: TerrainI;

	// @TODO handle spontaneous changes
	public readonly entities = new Collection<EntityI>();

	public readonly time = new TimeLine();

	public readonly seed: SeedI;

	/*
	 * EVENTS
	 */

	public readonly $start = new Event('Game $start');

	public readonly $stop = new Event('Game $stop');

	/*
	 * EVENTED VALUES
	 */

	constructor(seed: SeedI, terrain: TerrainI) {
		this.seed = seed;
		this.terrain = terrain;

		this.entities.$add.on((added) =>
			added.forEach((entity) => {
				entity.attach(this);
			}),
		);

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
		this.$start.emit();
	}

	public stop() {
		this.$stop.emit();
	}

	/**
	 * Serialize for a save game JSON
	 */
	public serializeToSaveJson(): SavedGameJson {
		return {
			version: 'alpha', // todo version some time,
			terrain: this.terrain.serializeToSaveJson(),
			entities: this.entities.map((entity) => entity.serializeToSaveJson()),
			time: this.time.serializeToSaveJson(),
			seed: this.seed,
		};
	}
}

import { Collection, SavedCollection } from './classes/Collection.ts';
import { Event } from './classes/Event.ts';
import { SavedTimeLineI, TimeLine } from './classes/TimeLine.ts';
import { EntityI } from './entities/types.ts';
import { Terrain, type SavedTerrainI } from './terrain/Terrain.ts';
import { SeedI } from './types.ts';

export type SavedGame = {
	version: 'alpha';
	terrain: SavedTerrainI;
	entities: SavedCollection<EntityI>;
	time: SavedTimeLineI;
	seed: string | number;
};

export default class Game {
	public readonly terrain: Terrain;

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

	constructor(seed: SeedI, terrain: Terrain) {
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
	public serializeToSaveJson(): SavedGame {
		return {
			version: 'alpha', // todo version some time,
			seed: this.seed,
			terrain: this.terrain.serializeToSaveJson(),
			entities: this.entities.serializeToSaveJson(),
			time: this.time.serializeToSaveJson(),
		};
	}
}

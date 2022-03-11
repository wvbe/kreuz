import Logger from './classes/Logger';
import { TerrainI, EntityI, SeedI } from './types';
import { ContextMenuController } from './ui/ContextMenuController';

export class Game {
	public readonly contextMenu = new ContextMenuController();

	/**
	 * The "randomizer" logic/state
	 *
	 * @deprecated not working yet.
	 */
	public readonly random: unknown;

	public readonly terrain: TerrainI;

	// @TODO change to not readonly, and handle spontaneous changes
	public readonly entities: EntityI[];

	public readonly seed;
	constructor(seed: SeedI, terrain: TerrainI, entities: EntityI[]) {
		this.seed = seed;
		this.terrain = terrain;
		this.entities = entities;

		console.log('New game with seed: ' + this.seed, this);
	}

	play() {
		this.entities.forEach(entity => entity.play());
		return () => {
			this.destroy();
		};
	}

	destroy() {
		Logger.group(`Destroy ${this.constructor.name}`);
		this.entities.forEach(entity => entity.destroy());
		Logger.groupEnd();
	}
}

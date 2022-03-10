import Logger from './classes/Logger';
import { TerrainI, EntityI } from './types';
import { ContextMenuController } from './ui/ContextMenuController';

export class Game {
	public readonly contextMenu = new ContextMenuController();

	/**
	 * The "randomizer" logic/state
	 *
	 * @TODO implement game seed, save and load mechanismus
	 */
	public readonly random: unknown;

	public readonly terrain: TerrainI;

	// @TODO change to not readonly, and handle spontaneous changes
	public readonly entities: EntityI[];

	public readonly seed;
	constructor(seed: string, terrain: TerrainI, entities: EntityI[]) {
		this.seed = seed;
		this.terrain = terrain;
		this.entities = entities;
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

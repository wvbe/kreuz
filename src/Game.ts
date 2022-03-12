import { Event } from './classes/Event';
import { EntityI, SeedI, TerrainI } from './types';
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

	public readonly $destroy = new Event('Game#$destroy');
	constructor(seed: SeedI, terrain: TerrainI, entities: EntityI[]) {
		this.seed = seed;
		this.terrain = terrain;
		this.entities = entities;

		this.$destroy.on(() => this.entities.forEach(entity => entity.destroy()));
	}

	play() {
		this.entities.forEach(entity => entity.play());
		return () => {
			this.destroy();
		};
	}

	destroy() {
		this.$destroy.emit();
	}
}

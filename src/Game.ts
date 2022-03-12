import { createElement } from 'react';
import { Event } from './classes/Event';
import { CoordinateI, EntityI, SeedI, TerrainI, TileI } from './types';
import { ContextMenuController } from './ui/ContextMenuController';
import { ContextMenuForTile } from './ui/ContextMenuForTile';

type GameUiFocusable = TileI | EntityI | undefined;
class GameUI {
	private _focus: GameUiFocusable;
	public readonly $focus = new Event('GameUI#$focus');
	get focus(): GameUiFocusable {
		return this._focus;
	}
	set focus(item: GameUiFocusable) {
		this._focus = item;
		this.$focus.emit();
	}

	private _lookAt: CoordinateI;
	public readonly $lookAt = new Event('GameUI#$lookAt');
	get lookAt(): CoordinateI {
		return this._lookAt;
	}
	set lookAt(item: CoordinateI) {
		this._lookAt = item;
		this.$lookAt.emit();
	}

	constructor(terrain: TerrainI) {
		this._lookAt = terrain.getMedianCoordinate();
	}
}

export class Game {
	public readonly contextMenu = new ContextMenuController();
	public readonly ui: GameUI;

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

	/**
	 * @deprecated Not in use yet
	 */
	public readonly $start = new Event('Game#$start');

	public readonly $destroy = new Event('Game#$destroy');

	constructor(seed: SeedI, terrain: TerrainI, entities: EntityI[]) {
		this.seed = seed;
		this.terrain = terrain;
		this.entities = entities;
		this.ui = new GameUI(this.terrain);

		this.$destroy.on(() => this.entities.forEach(entity => entity.destroy()));
	}

	play() {
		this.entities.forEach(entity => entity.play());
		this.$start.emit();
		return () => {
			this.destroy();
		};
	}

	openContextMenuOnTile(tile: TileI) {
		this.contextMenu.open(tile, createElement(ContextMenuForTile, { game: this, tile }));
	}

	destroy() {
		this.$destroy.emit();
	}
}

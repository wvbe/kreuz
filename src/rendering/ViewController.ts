import { Event } from '../classes/Event';
import { Game } from '../Game';
import { CoordinateI, EntityPersonI, TileI, ViewI } from '../types';

export class ViewController implements ViewI {
	/**
	 * The event that the viewport is resized
	 */
	public readonly $dispose = new Event('ViewController#$dispose');

	/**
	 * The event that an entity mesh is clicked
	 */
	public readonly $clickEntity = new Event<[MouseEvent, EntityPersonI]>(
		'ViewController#$clickEntity'
	);

	/**
	 * The event that a tile mesh is clicked
	 */
	public readonly $clickTile = new Event<[MouseEvent, TileI]>('ViewController#$clickTile');

	/**
	 * The event that the ThreeJS canvas was clicked, but it was not on an entity or tile.
	 */
	public readonly $click = new Event<[MouseEvent]>('ViewController#$click');

	constructor() {
		this.$dispose.on(() => {
			this.$click.clear();
			this.$clickEntity.clear();
			this.$clickTile.clear();
		});
	}

	public attachToGame(game: Game) {
		game.$destroy.on(this.dispose.bind(this));

		this.$dispose.once(
			this.$clickTile.on((event, tile) => {
				event.preventDefault();
				event.stopPropagation();
				game.openContextMenuOnTile(tile);
			})
		);
		this.$dispose.once(
			this.$clickEntity.on((event, entity) => {
				event.preventDefault();
				event.stopPropagation();
				game.ui.focus = entity;
				game.contextMenu.close();
			})
		);
		this.$dispose.once(
			this.$click.on(event => {
				event.preventDefault();
				game.contextMenu.close();
				// @TODO
			})
		);
		this.$dispose.once(
			game.ui.$lookAt.on(() => {
				this.setCameraFocus(game.ui.lookAt);
			})
		);
	}

	dispose() {
		this.$dispose.emit();
	}

	public setCameraFocus(coordinate: CoordinateI) {
		throw new Error('Not implemneted');
	}
}

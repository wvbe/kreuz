import { createElement } from 'react';
import { Coordinate } from './classes/Coordinate';
import { Event } from './classes/Event';
import { EventedValue } from './classes/EventedValue';
import { TimeLine } from './classes/TimeLine';
import { CoordinateI, EntityI, SeedI, TerrainI, TileI } from './types';
import { ContextMenuController } from './ui/ContextMenuController';
import { ContextMenuForTile } from './ui/ContextMenuForTile';

type GameUiFocusable = TileI | EntityI | undefined;

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

	public readonly time = new TimeLine();

	public readonly seed;

	/*
	 * EVENTS
	 */

	public readonly $start = new Event('Game#$start');

	public readonly $destroy = new Event('Game#$destroy');

	/*
	 * EVENTED VALUES
	 */

	public readonly focus = new EventedValue<GameUiFocusable>(undefined);

	/**
	 * @deprecated This evented value should probably live on ThreeController
	 */
	public readonly lookAt = new EventedValue<CoordinateI>(new Coordinate(0, 0, 0));

	constructor(seed: SeedI, terrain: TerrainI, entities: EntityI[]) {
		this.seed = seed;
		this.terrain = terrain;
		this.entities = entities;
		this.lookAt.set(terrain.getMedianCoordinate());

		this.$start.on(() => {
			this.entities.forEach(entity => entity.play());
		});

		this.$destroy.on(() => this.entities.forEach(entity => entity.destroy()));
	}

	play() {
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

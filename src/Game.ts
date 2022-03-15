import { createElement, ReactElement } from 'react';
import { Coordinate } from './classes/Coordinate';
import { Event } from './classes/Event';
import { EventedValue } from './classes/EventedValue';
import { TimeLine } from './classes/TimeLine';
import { CoordinateI, EntityI, SeedI, TerrainI, TileI } from './types';
import { ContextMenuForTile } from './ui/ContextMenuForTile';

type GameUiFocusable = TileI | EntityI | undefined;

export class Game {
	/**
	 * The "randomizer" logic/state
	 *
	 * @deprecated not working yet.
	 */
	public readonly random: unknown;

	public readonly terrain: TerrainI;

	// @TODO change to not readonly, and handle spontaneous changes
	public readonly entities: EntityI[];

	public readonly time = new TimeLine(1);

	public readonly seed;

	/*
	 * EVENTS
	 */

	public readonly $start = new Event('Game#$start');

	public readonly $destroy = new Event('Game#$destroy');

	/*
	 * EVENTED VALUES
	 */

	public readonly $$focus = new EventedValue<GameUiFocusable>(undefined);

	/**
	 * @deprecated This evented value should maybe live on ThreeController
	 */
	public readonly $$lookAt = new EventedValue<CoordinateI>(new Coordinate(0, 0, 0));

	public readonly $$contextMenu = new EventedValue<
		| false
		| {
				location: CoordinateI;
				contents: ReactElement;
		  }
	>(false);

	constructor(seed: SeedI, terrain: TerrainI, entities: EntityI[]) {
		this.seed = seed;
		this.terrain = terrain;
		this.entities = entities;
		this.$$lookAt.set(terrain.getMedianCoordinate());

		this.$start.on(() => {
			this.entities.forEach(entity => entity.play(this));
		});

		this.$destroy.on(() => this.entities.forEach(entity => entity.destroy()));
	}

	play() {
		this.$start.emit();
		return () => {
			this.destroy();
		};
	}

	public openContextMenuOnTile(tile: TileI) {
		this.openContextMenuOnCoordinate(
			tile,
			createElement(ContextMenuForTile, { game: this, tile })
		);
	}
	private openContextMenuOnCoordinate(location: CoordinateI, contents: ReactElement) {
		this.$$contextMenu.set({ location, contents });
	}
	public closeContextMenu() {
		if (!this.isContextMenuOpen()) {
			return;
		}
		this.$$contextMenu.set(false);
	}
	private isContextMenuOpen() {
		return !!this.$$contextMenu.get();
	}

	destroy() {
		this.$destroy.emit();
	}
}

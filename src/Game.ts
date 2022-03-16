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

	/**
	 * The game entity that is shown in the "active entity" overlay.
	 */
	public readonly $$focus = new EventedValue<GameUiFocusable>(undefined);

	/**
	 * The coordinates at which the camera is pointed.
	 */
	public readonly $$cameraFocus = new EventedValue<CoordinateI>(new Coordinate(0, 0, 0));

	/**
	 * The context menu information if it is opened, or false if it is not
	 */
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
		this.$$cameraFocus.set(terrain.getMedianCoordinate());

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

	private _destroyCameraFollowEntity: (() => void) | null = null;
	public setCameraFollowEntity(entity: EntityI) {
		if (this._destroyCameraFollowEntity) {
			this._destroyCameraFollowEntity();
		}
		this.$$cameraFocus.set(entity.$$location.get());
		const destroy = entity.$$location.on(() => {
			this.$$cameraFocus.set(entity.$$location.get());
		});

		this._destroyCameraFollowEntity = () => {
			destroy();
			destroyOnDestroy();
			this._destroyCameraFollowEntity = null;
		};

		const destroyOnDestroy = this.$destroy.on(this._destroyCameraFollowEntity);

		return this._destroyCameraFollowEntity;
	}

	destroy() {
		this.$destroy.emit();
	}
}

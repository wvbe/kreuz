import { Coordinate } from './classes/Coordinate.ts';
import { Event } from './classes/Event.ts';
import { EventedValue } from './classes/EventedValue.ts';
import { TimeLine } from './classes/TimeLine.ts';
import { EntityI } from './entities/types.ts';
import { SavedGameJson } from './types-savedgame.ts';
import { CoordinateI, SeedI, TerrainI, TileI } from './types.ts';

type GameUiFocusable = TileI | EntityI | undefined;

export default class Game {
	public readonly terrain: TerrainI;

	// @TODO change to not readonly, and handle spontaneous changes
	public readonly entities: EntityI[] = [];

	public readonly time = new TimeLine();

	public readonly seed: SeedI;

	/*
	 * EVENTS
	 */

	public readonly $start = new Event('Game#$start');

	public readonly $stop = new Event('Game#$stop');

	public readonly $destroy = new Event('Game#$destroy');

	/*
	 * EVENTED VALUES
	 */

	/**
	 * The game entity that is shown in the "active entity" overlay.
	 */
	public readonly $$focus = new EventedValue<GameUiFocusable>(undefined, 'Game#$$focus');

	/**
	 * The coordinates at which the camera is pointed.
	 */
	public readonly $$cameraFocus = new EventedValue<CoordinateI>(
		new Coordinate(0, 0, 0),
		'Game#$$cameraFocus',
	);

	constructor(seed: SeedI, terrain: TerrainI, entities: EntityI[]) {
		this.seed = seed;
		this.terrain = terrain;
		this.$$cameraFocus.set(terrain.getMedianCoordinate());
		entities.forEach((entity) => this.registerEntity(entity));

		(window as any).getSaveGame = () => {
			console.log(JSON.stringify(this.serializeToSaveJson(), null, '\t'));
		};
	}

	/**
	 * Announces to all those who listen (but want to remain agnostic of the driver) that the
	 * game has started. This usually coincides with a render loop etc. being handled by the
	 * driver.
	 *
	 * Normally called by the driver, or from a unit test.
	 */
	start() {
		this.$start.emit();
	}
	stop() {
		this.$stop.emit();
	}

	/**
	 * Private because AFAIK no usecase for this method outside class
	 */
	private registerEntity(entity: EntityI) {
		this.entities.push(entity);

		this.$start.on(() => {
			entity.play(this);
		});

		this.$destroy.on(() => {
			entity.destroy();
		});
	}

	#destroyCameraFollowEntity: (() => void) | null = null;
	/**
	 * Set the camera focus on an entity, and keep following it when the entity moves.
	 */
	public setCameraFollowEntity(entity: EntityI) {
		if (this.#destroyCameraFollowEntity) {
			this.#destroyCameraFollowEntity();
		}
		this.$$cameraFocus.set(entity.$$location.get());
		const destroy = entity.$$location.on(() => {
			this.$$cameraFocus.set(entity.$$location.get());
		});

		this.#destroyCameraFollowEntity = () => {
			destroy();
			destroyOnDestroy();
			this.#destroyCameraFollowEntity = null;
		};

		const destroyOnDestroy = this.$destroy.on(this.#destroyCameraFollowEntity);

		return this.#destroyCameraFollowEntity;
	}

	destroy() {
		this.$destroy.emit();
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

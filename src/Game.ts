import { Event } from './classes/Event.ts';
import { TimeLine } from './classes/TimeLine.ts';
import { EntityI } from './entities/types.ts';
import { SavedGameJson } from './types-savedgame.ts';
import { SeedI, TerrainI } from './types.ts';

export default class Game {
	public readonly terrain: TerrainI;

	// @TODO change to not readonly, and handle spontaneous changes
	public readonly entities: EntityI[] = [];

	public readonly time = new TimeLine();

	public readonly seed: SeedI;

	/*
	 * EVENTS
	 */

	public readonly $start = new Event('Game $start');

	public readonly $stop = new Event('Game $stop');

	public readonly $destroy = new Event('Game $destroy');

	/*
	 * EVENTED VALUES
	 */

	constructor(seed: SeedI, terrain: TerrainI, entities: EntityI[]) {
		this.seed = seed;
		this.terrain = terrain;
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
	public start() {
		this.$start.emit();
	}

	public stop() {
		this.$stop.emit();
	}

	/**
	 * Private because AFAIK no usecase for this method outside class _yet_
	 */
	private registerEntity(entity: EntityI) {
		this.entities.push(entity);

		entity.attach(this);

		this.$destroy.on(() => {
			entity.destroy();
		});
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

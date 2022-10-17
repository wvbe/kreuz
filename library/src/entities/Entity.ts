import { Coordinate } from '../terrain/Coordinate.ts';
import { Event } from '../classes/Event.ts';
import { EventedValue } from '../classes/EventedValue.ts';
import type Game from '../Game.ts';
import { type JobI } from '../jobs/types.ts';
import { type SaveEntityJson } from '../types-savedgame.ts';
import { type CoordinateI } from '../types.ts';
import { type EntityI } from './types.ts';

export class Entity implements EntityI {
	/**
	 * Unique identifier
	 *
	 * Probably more useful as a seed than anything else.
	 */
	public readonly id: string;

	public $$location: EventedValue<CoordinateI>;

	public $detach = new Event(`Entity $destroy`);

	/**
	 * Used for generating a save
	 */
	public type = 'entity';

	/**
	 * The set of behaviour/tasks given to this entity.
	 */
	public job?: JobI;

	constructor(id: string, location: CoordinateI) {
		this.id = id;
		this.$$location = new EventedValue(Coordinate.clone(location), 'Entity#$$location');
	}

	public get label(): string {
		return `${this.constructor.name} ${this.id}`;
	}

	public get icon(): string {
		return '📦';
	}

	public get title(): string {
		return 'Not doing anything';
	}

	toString() {
		return this.label;
	}

	public attach(game: Game): void {
		this.$detach.once(
			game.$start.on(() => {
				this.job?.start(game);
			}),
		);
	}

	public doJob(job: JobI) {
		this.job = job;
		this.$detach.once(() => {
			// @TODO handle the case where job changed in the mean time?
			job.destroy();
		});
	}

	public detach() {
		this.$detach.emit();
	}
	/**
	 * Serialize for a save game JSON
	 */
	public serializeToSaveJson(): SaveEntityJson {
		return {
			type: this.type,
			id: this.id,
			location: this.$$location.get().toArray(),
		};
	}
}

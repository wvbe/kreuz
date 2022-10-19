import { Attachable } from '../classes/Attachable.ts';
import { EventedValue } from '../classes/EventedValue.ts';
import type Game from '../Game.ts';
import { type JobI } from '../jobs/types.ts';
import { Coordinate } from '../terrain/Coordinate.ts';
import { type SaveEntityJson } from '../types-savedgame.ts';
import { type CoordinateI } from '../types.ts';
import { type EntityI } from './types.ts';

export class Entity extends Attachable<[Game]> implements EntityI {
	/**
	 * Unique identifier
	 *
	 * Probably more useful as a seed than anything else.
	 */
	public readonly id: string;

	public $$location: EventedValue<CoordinateI>;

	/**
	 * Used for generating a save
	 */
	public type = 'entity';

	/**
	 * The set of behaviour/tasks given to this entity.
	 */
	public $$job = new EventedValue<JobI | null>(null, `${this.constructor.name} $$job`);

	constructor(id: string, location: CoordinateI) {
		super();

		this.id = id;

		this.$$location = new EventedValue(
			Coordinate.clone(location),
			`${this.constructor.name} $$location`,
		);

		this.$attach.on((game) => {
			// Attach any job in the future
			this.$detach.once(this.$$job.on((job) => job?.attach(game)));

			// Attach any job that the entity may already have
			this.$$job.get()?.attach(game);

			this.$detach.once(() => this.$$job.get()?.detach());
		});
	}

	public get label(): string {
		return `${this.icon} ${this.constructor.name} ${this.id}`;
	}

	public get icon(): string {
		return '📦';
	}

	public get title(): string {
		return this.$$job.get()?.label || 'Not doing anything';
	}

	toString() {
		return this.label;
	}

	public doJob(job: JobI | null) {
		this.$$job.set(job);
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

import { EntityI, JobI, TileI } from '../types';
const noop = () => {};

export class Entity implements EntityI {
	public readonly id: string;

	public location: TileI;

	/**
	 * The set of behaviour/tasks given to this entity.
	 */
	public job?: JobI;

	constructor(id: string, location: TileI) {
		this.id = id;
		this.location = location;
	}

	public get label(): string {
		return `${this.constructor.name} ${this.id}`;
	}

	public play() {
		return this.job?.start() || noop;
	}

	public doJob(job: JobI) {
		this.job = job;

		// @TODO maybe some events
	}
	public destroy() {
		this.job?.destroy();
	}
}

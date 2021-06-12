import { FunctionComponent } from 'react';
import { TerrainCoordinate } from '../classes/TerrainCoordinate';
import { Job } from '../jobs/Job';
const noop = () => {};

export class Entity {
	public readonly id: string;

	/**
	 * The React SVG component that consitutes this entity. Is expected to be defined in a class
	 * that extends `Entity`.
	 */
	public readonly Component: FunctionComponent = () => {
		return null;
	};

	public location: TerrainCoordinate;

	/**
	 * The set of behaviour/tasks given to this entity.
	 */
	public job?: Job;

	constructor(id: string, location: TerrainCoordinate) {
		this.id = id;
		this.location = location;
	}

	public get label(): string {
		throw new Error(`${this.constructor.name} ${this.id}`);
	}

	public play() {
		return this.job?.start() || noop;
	}

	public doJob(job: Job) {
		this.job = job;

		// @TODO maybe some events
	}
}

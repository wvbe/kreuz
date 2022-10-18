import { EntityI, EntityPersonI } from '../entities/types.ts';
import Game from '../Game.ts';
import { type JobI } from './types.ts';

export class Job<EntityGeneric extends EntityI> implements JobI {
	protected entity: EntityGeneric;

	constructor(entity: EntityGeneric) {
		this.entity = entity;
	}

	get label(): string {
		throw new Error(`Not implemented for ${this.constructor.name}`);
	}

	/**
	 * Boolean on wether or not this entity can start this job right now.
	 */
	isAvailable(): boolean {
		// @TODO
		return true;
	}

	start(_game: Game) {
		// Logger.log(`Start ${this.constructor.name}`);
	}

	destroy() {
		// Logger.log(`Destroy ${this.constructor.name}`);
	}
}

import { Attachable } from '../classes/Attachable.ts';
import { EntityI, EntityPersonI } from '../entities/types.ts';
import Game from '../Game.ts';
import { type JobI } from './types.ts';

export class Job<EntityGeneric extends EntityI> extends Attachable<[Game]> implements JobI {
	protected entity: EntityGeneric;

	constructor(entity: EntityGeneric) {
		super();
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
}

import Logger from '../classes/Logger';
import { EntityPersonI, JobI } from '../types';

export class Job implements JobI {
	protected entity: EntityPersonI;
	constructor(entity: EntityPersonI) {
		this.entity = entity;
	}

	get label(): string {
		throw new Error(`Not implemented for ${this.constructor.name}`);
	}

	start() {
		Logger.log(`Start ${this.constructor.name}`);
	}

	destroy() {
		Logger.log(`Destroy ${this.constructor.name}`);
	}
}

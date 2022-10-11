import { EntityPersonI } from '../entities/types.ts';
import Game from '../Game.ts';
import { type JobI } from './types.ts';

export class Job implements JobI {
	protected entity: EntityPersonI;

	constructor(entity: EntityPersonI) {
		this.entity = entity;
	}

	get label(): string {
		throw new Error(`Not implemented for ${this.constructor.name}`);
	}

	start(_game: Game) {
		// Logger.log(`Start ${this.constructor.name}`);
	}

	destroy() {
		// Logger.log(`Destroy ${this.constructor.name}`);
	}
}

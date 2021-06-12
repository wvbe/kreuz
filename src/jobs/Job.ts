import { Entity } from '../entities/Entity';

export class Job<E = Entity> {
	entity: E;
	constructor(entity: E) {
		this.entity = entity;
	}

	get label(): string {
		throw new Error(`Not implemented for ${this.constructor.name}`);
	}

	start() {
		throw new Error(`Not implemented for ${this.constructor.name}`);
	}
}

import { Random } from '../classes/Random.ts';
import Game from '../Game.ts';
import { type JobI } from './types.ts';
import { Job } from './Job.ts';
import { Blueprint } from '../inventory/Blueprint.ts';
import { type DestroyerFn } from '../types.ts';
import { EntityI } from '../entities/types.ts';
import { FactoryBuildingEntity } from '../entities/FactoryBuildingEntity.ts';

export class FactoryProductionJob extends Job<FactoryBuildingEntity> implements JobI {
	private readonly destroyers: DestroyerFn[] = [];

	#blueprint: Blueprint;

	constructor(entity: FactoryBuildingEntity, blueprint: Blueprint) {
		super(entity);
		this.#blueprint = blueprint;
	}

	get label() {
		return this.#blueprint.name;
	}
}

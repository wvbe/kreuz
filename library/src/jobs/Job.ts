import { Attachable } from '../classes/Attachable.ts';
import { EntityI } from '../entities/types.ts';
import Game from '../Game.ts';
import { type JobI } from './types.ts';

export class Job<EntityGeneric extends EntityI> extends Attachable<[Game]> implements JobI {
	get label(): string {
		throw new Error(`Not implemented for ${this.constructor.name}`);
	}
}

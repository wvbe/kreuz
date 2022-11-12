import { EntityI } from './types.ts';
import { Entity } from './entity.ts';

export class ForestEntity extends Entity implements EntityI {
	public type = 'forest';
	public get name(): string {
		return 'Tree';
	}
}

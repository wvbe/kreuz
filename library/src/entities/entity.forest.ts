import { EntityI } from './types.ts';
import { Entity } from './entity.ts';

export class ForestEntity extends Entity implements EntityI {
	/**
	 * @deprecated not used yet.
	 */
	public type = 'forest';
	public get name(): string {
		return 'Tree';
	}
	public get title(): string {
		return 'Sucking moisture';
	}
}

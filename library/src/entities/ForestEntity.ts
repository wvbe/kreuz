import { EntityI } from './types.ts';
import { Entity } from './Entity.ts';

export class ForestEntity extends Entity implements EntityI {
	/**
	 * @deprecated not used yet.
	 */
	public type = 'forest';
	public get label(): string {
		return 'Tree';
	}
	public get title(): string {
		return 'Sucking moisture';
	}
}

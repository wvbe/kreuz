import { EntityI, TileI } from '../types';
import { Entity } from './Entity';

export class TreeEntity extends Entity implements EntityI {
	constructor(id: string, location: TileI) {
		super(id, location);
	}

	public get label(): string {
		return 'Tree';
	}
}

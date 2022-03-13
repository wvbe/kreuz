import { EntityI } from '../types';
import { Entity } from './Entity';

export class TreeEntity extends Entity implements EntityI {
	public get label(): string {
		return 'Tree';
	}
}

import { EntityI, TileI } from '../types';
import { Entity } from './Entity';

export class BuildingEntity extends Entity implements EntityI {
	protected readonly userData: { label: string };

	constructor(
		id: string,
		location: TileI,
		userData = {
			label: 'Test building'
		}
	) {
		super(id, location);
		this.userData = userData;
	}

	public get label(): string {
		return this.userData.label;
	}
}

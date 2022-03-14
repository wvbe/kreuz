import { SettlementProperties } from '../rendering/threejs/entities';
import { EntityI, TileI } from '../types';
import { Entity } from './Entity';

export class SettlementEntity extends Entity implements EntityI {
	public readonly userData: SettlementProperties;

	constructor(id: string, location: TileI, userData: SettlementProperties) {
		super(id, location);
		this.userData = userData;
	}

	public get label(): string {
		return this.id;
	}
}

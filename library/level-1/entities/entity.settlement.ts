import { CoordinateI } from '../types.ts';
import { Entity } from './entity.ts';
import { EntityI } from './types.ts';

export type SettlementParametersI = {
	name: string;
	areaSize: number;
	minimumBuildingLength: number;
	scale: number;
};

export class SettlementEntity extends Entity implements EntityI {
	public readonly parameters: SettlementParametersI;

	// @TODO proper implementation of BuildingI and CollectionI
	public readonly buildings: never[];

	/**
	 * @deprecated not used yet.
	 */
	public type = 'settlement';

	constructor(id: string, location: CoordinateI, parameters: SettlementParametersI) {
		super(id, location);
		this.parameters = parameters;
		this.buildings = [];

		this.$status.set(`Town of ${Math.round(this.parameters.areaSize * 1000)} souls.`, true);
	}

	public get name(): string {
		return this.parameters.name;
	}
	public get icon(): string {
		return '🏠';
	}
}

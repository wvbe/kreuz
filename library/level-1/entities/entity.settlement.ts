import { type SaveEntityJson } from '../types-savedgame.ts';
import { SimpleCoordinate } from '../types.ts';
import { Entity } from './entity.ts';
import { EntityI } from './types.ts';

export type SettlementParametersI = {
	name: string;
	areaSize: number;
	minimumBuildingLength: number;
	scale: number;
};

export type SaveSettlementEntityJson = SaveEntityJson<'settlement'> & SettlementParametersI;

export class SettlementEntity extends Entity implements EntityI {
	public readonly parameters: SettlementParametersI;

	// @TODO proper implementation of BuildingI and CollectionI
	public readonly buildings: never[];

	public type = 'settlement';

	constructor(id: string, location: SimpleCoordinate, parameters: SettlementParametersI) {
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
	public static fromSaveJson(save: SaveSettlementEntityJson) {
		const { id, location, ...parameters } = save;
		const inst = new SettlementEntity(id, location, parameters);
		return inst;
	}
}

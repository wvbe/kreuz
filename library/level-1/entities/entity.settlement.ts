import Game from '../Game.ts';
import { SaveJsonContext } from '../types-savedgame.ts';
import { SimpleCoordinate } from '../types.ts';
import { Entity, type SaveEntityJson } from './entity.ts';
import { EntityI } from './types.ts';

export type SettlementParametersI = {
	name: string;
	areaSize: number;
	minimumBuildingLength: number;
	scale: number;
};

export type SaveSettlementEntityJson = SaveEntityJson & { options: SettlementParametersI };

export class SettlementEntity extends Entity implements EntityI {
	public readonly parameters: SettlementParametersI;

	public type = 'settlement';

	constructor(id: string, location: SimpleCoordinate, parameters: SettlementParametersI) {
		super(id, location);
		this.parameters = parameters;

		this.$status.set(`Town of ${Math.round(this.parameters.areaSize * 1000)} souls.`, true);
	}

	public get name(): string {
		return this.parameters.name;
	}

	public get icon(): string {
		return '🏠';
	}

	public toSaveJson(context: SaveJsonContext): SaveSettlementEntityJson {
		return {
			...super.toSaveJson(context),
			options: this.parameters,
		};
	}

	public static fromSaveJson(context: SaveJsonContext, save: SaveSettlementEntityJson) {
		const { id, location, options } = save;
		const inst = new SettlementEntity(id, location, options);
		return inst;
	}
}

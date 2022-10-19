import { EventedValue } from '../classes/EventedValue.ts';
import { ProgressingNumericValue } from '../classes/ProgressingNumericValue.ts';
import { Blueprint } from '../inventory/Blueprint.ts';
import { CoordinateI } from '../types.ts';
import { BuildingEntity, BuildingParameters } from './BuildingEntity.ts';
import { EntityI } from './types.ts';

enum FactoryState {
	IDLE,
	BUSY,
}

export class FactoryBuildingEntity extends BuildingEntity implements EntityI {
	public blueprint: Blueprint | null = null;

	public constructor(id: string, location: CoordinateI, parameters: BuildingParameters) {
		super(id, location, parameters);
		this.$attach.on((game) => {});
	}
}

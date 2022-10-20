import { CoordinateI } from '../types.ts';
import { BuildingEntity } from './entity.building.ts';
import { EntityI } from './types.ts';

export class ChurchBuildingEntity extends BuildingEntity implements EntityI {
	public readonly type = 'church';

	constructor(id: string, location: CoordinateI) {
		super(id, location, {
			baseDepth: 1,
			baseHeight: 1,
			baseWidth: 1,
			roofHeight: 1,
		});
	}

	public get label() {
		return 'Church';
	}

	public get icon() {
		return '💒';
	}
}

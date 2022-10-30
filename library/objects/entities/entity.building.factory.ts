import { Inventory } from '../inventory/Inventory.ts';
import { type CoordinateI } from '../types.ts';
import { BuildingEntity } from './entity.building.ts';
import { type EntityI } from './types.ts';

export class FactoryBuildingEntity extends BuildingEntity implements EntityI {
	public readonly type = 'factory';

	public readonly inventory = new Inventory(8);

	public get name() {
		return `Empty factory building`;
	}

	public get icon() {
		return '🏭';
	}

	public constructor(id: string, location: CoordinateI) {
		super(id, location, {
			baseDepth: 1,
			baseHeight: 1,
			baseWidth: 1,
			roofHeight: 1,
		});
		this.$attach.on((game) => {});
	}
}

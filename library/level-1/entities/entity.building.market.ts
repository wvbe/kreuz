import { Inventory } from '../inventory/Inventory.ts';
import { Material } from '../inventory/Material.ts';
import { CoordinateI } from '../types.ts';
import { BuildingEntity } from './entity.building.ts';
import { EntityI } from './types.ts';

export class MarketBuildingEntity extends BuildingEntity implements EntityI {
	public readonly type = 'market-stall';

	public readonly inventory = new Inventory(4);

	public readonly material: Material;

	constructor(id: string, location: CoordinateI, material: Material) {
		super(id, location, {
			baseDepth: 1,
			baseHeight: 1,
			baseWidth: 1,
			roofHeight: 1,
		});
		this.material = material;
	}

	public get name() {
		return `${this.material.label} stall`;
	}
	public get title() {
		return `Sells ${this.material} for 💰${this.material.value} apiece`;
	}

	public get icon() {
		return '🏪';
	}
}

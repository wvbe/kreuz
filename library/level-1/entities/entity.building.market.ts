import { Inventory, type SaveInventoryJson } from '../inventory/Inventory.ts';
import { Material } from '../inventory/Material.ts';
import { SimpleCoordinate } from '../types.ts';
import { BuildingEntity } from './entity.building.ts';
import { type SaveBuildingEntityJson } from './entity.building.ts';
import { EntityI } from './types.ts';

export type SaveMarketBuildingEntityJson = SaveBuildingEntityJson & {
	material: Material;
	inventory: SaveInventoryJson;
};

export class MarketBuildingEntity extends BuildingEntity implements EntityI {
	public readonly type = 'market-stall';

	public readonly inventory = new Inventory(4);

	public readonly material: Material;

	constructor(id: string, location: SimpleCoordinate, material: Material) {
		super(id, location, {
			baseDepth: 1,
			baseHeight: 1,
			baseWidth: 1,
			roofHeight: 1,
		});
		this.material = material;
		this.$status.set(`Sells ${this.material} for 💰${this.material.value} apiece`, true);
	}

	public get name() {
		return `${this.material.label} stall`;
	}

	public get icon() {
		return '🏪';
	}

	public toSaveJson(): SaveMarketBuildingEntityJson {
		return {
			...super.toSaveJson(),
			material: this.material,
			inventory: this.inventory.toSaveJson(),
		};
	}

	public static fromSaveJson(save: SaveMarketBuildingEntityJson): MarketBuildingEntity {
		const { id, location, material, inventory } = save;
		const inst = new MarketBuildingEntity(id, location, material);
		inst.inventory.overwriteFromSaveJson(inventory);
		return inst;
	}
}

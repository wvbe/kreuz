import { PersonEntity, type SavePersonEntityJson } from './entity.person.ts';
import { Inventory, type SaveInventoryJson } from '../inventory/Inventory.ts';
import { Material } from '../inventory/Material.ts';
import { SimpleCoordinate } from '../types.ts';
import { BuildingEntity } from './entity.building.ts';
import { type SaveBuildingEntityJson } from './entity.building.ts';
import { EntityI } from './types.ts';
import Game from '../Game.ts';
import { SaveJsonContext } from '../types-savedgame.ts';

export type SaveMarketBuildingEntityJson = SaveBuildingEntityJson & {
	material: Material;
	inventory: SaveInventoryJson;
	owner: SavePersonEntityJson;
};

export class MarketBuildingEntity extends BuildingEntity implements EntityI {
	public readonly type = 'market-stall';

	public readonly inventory = new Inventory(4);

	public readonly owner: PersonEntity;

	public readonly material: Material;

	constructor(id: string, location: SimpleCoordinate, material: Material, owner: PersonEntity) {
		super(id, location, {
			baseDepth: 1,
			baseHeight: 1,
			baseWidth: 1,
			roofHeight: 1,
		});
		this.material = material;
		this.owner = owner;
		void this.$status.set(`Sells ${this.material} for 💰${this.material.value} apiece`, true);
	}

	public get name() {
		return `${this.material.label} stall`;
	}

	public get icon() {
		return '🏪';
	}

	public toSaveJson(context: SaveJsonContext): SaveMarketBuildingEntityJson {
		return {
			...super.toSaveJson(context),
			material: this.material,
			owner: this.owner.toSaveJson(context),
			inventory: this.inventory.toSaveJson(context),
		};
	}

	public static async fromSaveJson(
		context: SaveJsonContext,
		save: SaveMarketBuildingEntityJson,
	): Promise<MarketBuildingEntity> {
		const { id, location, material, inventory, owner } = save;
		const inst = new MarketBuildingEntity(
			id,
			location,
			material,
			await PersonEntity.fromSaveJson(context, owner),
		);
		await inst.inventory.overwriteFromSaveJson(context, inventory);
		return inst;
	}
}

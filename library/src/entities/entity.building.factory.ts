import { Inventory } from '../inventory/Inventory.ts';
import { ProductionJob } from '../jobs/ProductionJob.ts';
import { CoordinateI } from '../types.ts';
import { BuildingEntity, BuildingParameters } from './entity.building.ts';
import { EntityI } from './types.ts';

export class FactoryBuildingEntity extends BuildingEntity implements EntityI {
	public readonly type = 'factory';

	public readonly inventory = new Inventory(24);

	private getCurrentBlueprint() {
		const job = this.$$job.get() as ProductionJob | null;
		return job?.blueprint || null;
	}

	public get label() {
		const blueprint = this.getCurrentBlueprint();
		if (!blueprint) {
			return `${this.icon} Empty factory`;
		}
		return `${this.icon} ${blueprint.products[0].material.label} factory`;
	}

	public get icon() {
		return '🏭';
	}

	public constructor(id: string, location: CoordinateI, parameters: BuildingParameters) {
		super(id, location, parameters);
		this.$attach.on((game) => {});
	}
}

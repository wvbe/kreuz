import { Inventory } from '../inventory/Inventory.ts';
import { ProductionTask } from '../tasks/task.production.ts';
import { CoordinateI } from '../types.ts';
import { BuildingEntity, BuildingParameters } from './entity.building.ts';
import { EntityI } from './types.ts';

export class FactoryBuildingEntity extends BuildingEntity implements EntityI {
	public readonly type = 'factory';

	public readonly inventory = new Inventory(8);

	private getCurrentBlueprint() {
		const job = this.$$job.get() as ProductionTask | null;
		return job?.blueprint || null;
	}

	public get name() {
		const blueprint = this.getCurrentBlueprint();
		if (!blueprint) {
			return `Empty factory`;
		}
		return `${blueprint.products[0].material.label} factory`;
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

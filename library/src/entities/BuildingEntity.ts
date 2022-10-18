import { CoordinateI } from '../types.ts';
import { Entity } from './Entity.ts';
import { EntityI } from './types.ts';
import { Inventory } from '../inventory/Inventory.ts';

export type BuildingParameters = {
	baseWidth: number;
	baseDepth: number;
	baseHeight: number;
	roofHeight: number;
};

/**
 * @deprecated Should probably use settlement entity instead
 */
export class BuildingEntity extends Entity implements EntityI {
	/**
	 * @deprecated not used yet.
	 */
	public type = 'buiding';

	protected readonly parameters: BuildingParameters;

	public readonly inventory = new Inventory(24);

	constructor(id: string, location: CoordinateI, parameters: BuildingParameters) {
		super(id, location);
		this.parameters = parameters;
	}

	public get label(): string {
		return this.id;
	}
}

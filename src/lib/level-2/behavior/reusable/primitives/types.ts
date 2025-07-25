import { inventoryComponent } from '../../../../level-1/ecs/components/inventoryComponent';
import { locationComponent } from '../../../../level-1/ecs/components/locationComponent';
import { ownerComponent } from '../../../../level-1/ecs/components/ownerComponent';
import { pathingComponent } from '../../../../level-1/ecs/components/pathingComponent';
import { wealthComponent } from '../../../../level-1/ecs/components/wealthComponent';
import { EcsEntity } from '../../../../level-1/ecs/types';
import { Material } from '../../../../level-1/inventory/Material';

type VendorEntity = EcsEntity<
	| typeof inventoryComponent
	| typeof wealthComponent
	| typeof locationComponent
	| typeof ownerComponent
>;

export type DesirabilityRecord<IncludeVendor extends boolean> = {
	/**
	 * The person who's got an {@link Inventory} with this material in it.
	 *
	 * Set to `null` if the item does not need to be traded.
	 *
	 * @todo Rename to `vendor`
	 */
	market: IncludeVendor extends true ? VendorEntity : null;
	material: Material;
	score: number;
};

/**
 * A function with which the attractiveness of a purchase is evaluated. Useful for selecting
 * to make a deal between a buyer and any number of vendors.
 *
 * Return zero to not consider this purchase at all.
 */
export type VendorPurchaseScorer<IncludeVendor extends boolean> = (
	entity: IncludeVendor extends true
		? EcsEntity<
				| typeof inventoryComponent
				| typeof wealthComponent
				| typeof locationComponent
				| typeof pathingComponent
		  >
		: EcsEntity<typeof inventoryComponent>,
	vendor: IncludeVendor extends true ? VendorEntity : null,
	material: Material,
	available: number,
) => number;

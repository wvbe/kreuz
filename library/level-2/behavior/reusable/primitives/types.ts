import { FactoryBuildingEntity, MarketBuildingEntity, Material, PersonEntity } from '@lib/core';

export type VendorEntity = MarketBuildingEntity | FactoryBuildingEntity;

export type DesirabilityRecord<HasVendor extends boolean = boolean> = {
	/**
	 * The person who's got an {@link Inventory} with this material in it.
	 *
	 * Set to `null` if the item does not need to be traded.
	 *
	 * @todo Rename to `vendor`
	 */
	market: HasVendor extends true
		? VendorEntity
		: HasVendor extends false
		? null
		: VendorEntity | null;
	material: Material;
	score: number;
};

/**
 * A function with which the attractiveness of a purchase is evaluated. Useful for selecting
 * to make a deal between a {@link PersonEntity} and any number of {@link VendorEntity VendorEntities}
 *
 * Return zero to not consider this purchase at all.
 */
export type VendorPurchaseScorer = (
	entity: PersonEntity,
	vendor: VendorEntity | null,
	material: Material,
	available: number,
) => number;

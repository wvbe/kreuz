import { Material, TradeOrder } from '@lib/core';
import { PersonEntity, MarketBuildingEntity, FactoryBuildingEntity } from '@lib/core';

type VendorEntity = MarketBuildingEntity | FactoryBuildingEntity;

export type DesirabilityRecord = {
	// @todo rename to "vendor"
	market: VendorEntity;
	material: Material;
	score: number;
};

/**
 * A function with which the attractiveness of a purchase is evaluated. AMongst others, you could
 * use this to weigh several factors:
 * - How nutritious is an item?
 * - What does it cost, and can the entity affort it?
 * - How far away is it?
 *
 * Return zero to not consider this purchase at all.
 */
export type DesirabilityScoreFn = (
	entity: PersonEntity,
	vendor: VendorEntity | null,
	material: Material,
	available: number,
) => number;

/**
 * @todo Probably re-type this to match {@link TradeOrder} (eg. {@link TradeOrderConstructorParam})
 */
export function getMostDesirableItem(
	entity: PersonEntity,
	vendors: VendorEntity[],
	createDesirabilityScore: DesirabilityScoreFn,
) {
	return vendors
		.reduce<DesirabilityRecord[]>(
			(records, market) =>
				records.concat(
					market.inventory.getAvailableItems().map(({ material, quantity }) => ({
						market,
						material,
						score: createDesirabilityScore(entity, market, material, quantity),
					})),
				),
			[],
		)
		.filter((desirability) => desirability.score > 0)
		.sort((a, b) => a.score - b.score)
		.shift();
}

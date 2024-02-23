import { Material } from '@lib/core';
import { PersonEntity, MarketBuildingEntity, FactoryBuildingEntity } from '@lib/core';

type VendorEntity = MarketBuildingEntity | FactoryBuildingEntity | PersonEntity;

export type DesirabilityRecord = {
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
	seller: VendorEntity | null,
	material: Material,
	available: number,
) => number;

export function getMostDesirableItem(
	entity: PersonEntity,
	sellers: VendorEntity[],
	createDesirabilityScore: DesirabilityScoreFn,
) {
	return sellers
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

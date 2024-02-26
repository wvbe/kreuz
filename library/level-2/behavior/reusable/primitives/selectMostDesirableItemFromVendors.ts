import { PersonEntity, TradeOrder } from '@lib/core';
import { type DesirabilityRecord, type VendorPurchaseScorer, type VendorEntity } from './types.ts';

/**
 * @todo Probably re-type this to match {@link TradeOrder} (eg. {@link TradeOrderConstructorParam})
 */
export function selectMostDesirableItemFromVendors(
	entity: PersonEntity,
	vendors: VendorEntity[],
	createDesirabilityScore: VendorPurchaseScorer,
): DesirabilityRecord<true> | null {
	const scores: DesirabilityRecord[] = [];
	for (const market of vendors) {
		scores.push(
			...market.inventory
				.getAvailableItems()
				.map(({ material, quantity }) => ({
					market,
					material,
					score: createDesirabilityScore(entity, market, material, quantity),
				}))
				.filter((desirability) => desirability.score > 0),
		);
	}
	return scores.sort((a, b) => a.score - b.score).shift() || null;
}

import {
	EcsEntity,
	TradeOrder,
	inventoryComponent,
	locationComponent,
	pathingComponent,
	wealthComponent,
} from '@lib/core';
import { type DesirabilityRecord, type VendorPurchaseScorer } from './types.ts';
import { ownerComponent } from '@lib/core';

/**
 * @todo Probably re-type this to match {@link TradeOrder} (eg. {@link TradeOrderConstructorParam})
 */
export function selectMostDesirableItemFromVendors(
	entity: EcsEntity<
		| typeof inventoryComponent
		| typeof wealthComponent
		| typeof locationComponent
		| typeof pathingComponent
	>,
	vendors: EcsEntity<
		| typeof locationComponent
		| typeof wealthComponent
		| typeof inventoryComponent
		| typeof ownerComponent
	>[],
	createDesirabilityScore: VendorPurchaseScorer<true>,
): DesirabilityRecord<true> | null {
	const scores: DesirabilityRecord<true>[] = [];
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

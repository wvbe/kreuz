import {
	EcsEntity,
	inventoryComponent,
	locationComponent,
	ownerComponent,
	pathingComponent,
	wealthComponent,
} from '@lib/core';
import { type DesirabilityRecord, type VendorPurchaseScorer } from './types.ts';

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

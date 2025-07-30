import { inventoryComponent } from '../../../../core/ecs/components/inventoryComponent';
import { locationComponent } from '../../../../core/ecs/components/locationComponent';
import { ownerComponent } from '../../../../core/ecs/components/ownerComponent';
import { pathingComponent } from '../../../../core/ecs/components/pathingComponent';
import { wealthComponent } from '../../../../core/ecs/components/wealthComponent';
import { type EcsEntity } from '../../../../core/ecs/types';
import { type DesirabilityRecord, type VendorPurchaseScorer } from './types';

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

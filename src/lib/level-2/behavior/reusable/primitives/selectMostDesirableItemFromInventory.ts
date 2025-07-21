import { inventoryComponent } from '../../../../level-1/ecs/components/inventoryComponent';
import { EcsEntity } from '../../../../level-1/ecs/types';
import { DesirabilityRecord, VendorPurchaseScorer } from './types';

/**
 * @todo Probably re-type this to match {@link TradeOrder} (eg. {@link TradeOrderConstructorParam})
 */
export function selectMostDesirableItemFromInventory(
	entity: EcsEntity<typeof inventoryComponent>,
	createDesirabilityScore: VendorPurchaseScorer<false>,
): DesirabilityRecord<false> | null {
	const records: DesirabilityRecord<false>[] = [];
	for (const { material, quantity } of entity.inventory.getAvailableItems()) {
		const record: DesirabilityRecord<false> = {
			market: null,
			material,
			score: createDesirabilityScore(entity, null, material, quantity),
		};
		if (record.score > 0) {
			records.push(record);
		}
	}
	return records.sort((a, b) => a.score - b.score).shift() || null;
}

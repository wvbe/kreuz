import { Inventory, TradeOrder } from '@lib/core';
import { DesirabilityRecord, VendorPurchaseScorer } from './types.ts';
import { PersonEntity } from '@lib/core';

/**
 * @todo Probably re-type this to match {@link TradeOrder} (eg. {@link TradeOrderConstructorParam})
 */
export function selectMostDesirableItemFromInventory(
	entity: PersonEntity,
	createDesirabilityScore: VendorPurchaseScorer,
): DesirabilityRecord | null {
	const records: DesirabilityRecord[] = [];
	for (const { material, quantity } of entity.inventory.getAvailableItems()) {
		const record: DesirabilityRecord = {
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

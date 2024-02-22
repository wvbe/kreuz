import { BehaviorError, Material, PersonEntity, PersonNeedId } from '@lib/core';

type ConsumptionType = {
	createStatus(material: Material): string;
	needId: PersonNeedId;
	materialProperty: keyof Material;
};

/**
 * @todo
 * Make the need be fulfilled over a short amount of time, instead of instantaneously
 */
export async function consumeFromInventoryForNeed(
	config: ConsumptionType,
	entity: PersonEntity,
	material: Material,
): Promise<void> {
	await entity.$status.set(config.createStatus(material));
	await entity.inventory.change(material, -1);
	const need = entity.needs.find((n) => n.id === config.needId);
	if (!need) {
		throw new BehaviorError(`Expected entity to need ${config.needId}, but they don't`);
	}
	await need.set(need.get() + (material[config.materialProperty] as number));
}

consumeFromInventoryForNeed.DRINK = {
	createStatus: (material) => `Drinking ${material}`,
	needId: 'water',
	materialProperty: 'fluid',
} as ConsumptionType;

consumeFromInventoryForNeed.EAT = {
	createStatus: (material) => `Eating ${material}`,
	needId: 'food',
	materialProperty: 'nutrition',
} as ConsumptionType;

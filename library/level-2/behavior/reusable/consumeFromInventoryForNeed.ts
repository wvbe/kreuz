import { EventedPromise, Material, PersonEntity, PersonNeedId } from '../../../level-1/mod.ts';

type ConsumptionType = {
	createStatus(material: Material): string;
	needId: PersonNeedId;
	materialProperty: keyof Material;
};

export function consumeFromInventoryForNeed(
	config: ConsumptionType,
	entity: PersonEntity,
	material: Material,
) {
	entity.$status.set(config.createStatus(material));
	entity.inventory.change(material, -1);
	const need = entity.needs.find((n) => n.id === config.needId);
	if (!need) {
		throw new Error(`Expected entity to need ${config.needId}, but they don't`);
	}
	need.set(need.get() + (material[config.materialProperty] as number));
	return EventedPromise.resolve();
}

consumeFromInventoryForNeed.DRINK = {
	createStatus: (material) => `Drinking ${material}`,
	needId: 'water',
	materialProperty: 'fluid',
} as ConsumptionType;

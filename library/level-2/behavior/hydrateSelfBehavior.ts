import {
	EntityBlackboard,
	ExecutionNode,
	InverterNode,
	SelectorNode,
	SequenceNode,
	type FactoryBuildingEntity,
	type Inventory,
	type MaterialState,
} from '@lib/core';

import { getWaterFromWell } from '../blueprints.ts';
import {
	DesirabilityScoreFn,
	createBuyFromMarketSequence,
} from './reusable/nodes/createBuyFromMarketBehavior.ts';
import { createWaitBehavior } from './reusable/nodes/createWaitBehavior.ts';
import { consumeFromInventoryForNeed } from './reusable/primitives/consumeFromInventoryForNeed.ts';

const filterDrinkableMaterial = ({ material }: MaterialState) =>
	material.fluid && !material.toxicity;

const getMostDrinkableStateFromInventory = (inventory: Inventory) =>
	inventory
		.getAvailableItems()
		.filter(filterDrinkableMaterial)
		.sort((a, b) => a.material.fluid - b.material.fluid)
		.shift();

const scoreFluidDesirability: DesirabilityScoreFn = (entity, _market, material) => {
	// @TODO
	// - Better prioritize which food to buy, and which factory to go to
	if (entity.wallet.get() < material.value) {
		return 0;
	}
	return material.fluid / material.value;
};

/**
 * A behavior tree for eating any food available from inventory, or to go buy food.
 */
export const hydrateSelfBehavior = new SequenceNode<EntityBlackboard>(
	new ExecutionNode('Thirsty?', ({ entity }) => {
		// @TODO replace with Needs/moods
		const need = entity.needs.find((n) => n.id === 'water');
		if (!need) {
			throw new Error(`For some reason, ${entity} is unable to feel thirsty`);
		}
		if (need.get() > 0.2) {
			throw new Error(`${entity} isn't thirsty enough`);
		}
	}),
	new SelectorNode(
		new SequenceNode(
			new InverterNode(
				new ExecutionNode('Has no drinks?', ({ entity }) => {
					const hasSupplies = !!entity.inventory.getAvailableItems().filter(filterDrinkableMaterial)
						.length;
					if (!hasSupplies) {
						throw new Error(`${entity} does not have any drinks on hand`);
					}
				}),
			),
			createBuyFromMarketSequence(
				(vendor): vendor is FactoryBuildingEntity =>
					vendor.type === 'factory' &&
					(vendor as FactoryBuildingEntity).$blueprint.get() === getWaterFromWell,
				scoreFluidDesirability,
			),
		),
		new SequenceNode(
			new ExecutionNode('Drink from inventory?', async ({ entity }) => {
				const state = getMostDrinkableStateFromInventory(entity.inventory);
				if (!state) {
					throw new Error(`${entity} does not have any drinks on hand`);
				}
				await consumeFromInventoryForNeed(
					consumeFromInventoryForNeed.DRINK,
					entity,
					state.material,
				);
			}),
			createWaitBehavior(500, 3000),
			new ExecutionNode('Unset status', ({ entity }) => {
				entity.$status.set(null);
			}),
		),
	),
);

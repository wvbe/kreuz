import { EventedPromise } from '../classes/EventedPromise.ts';
import { type MarketBuildingEntity } from '../entities/entity.building.market.ts';
import { type Inventory } from '../inventory/Inventory.ts';
import { type MaterialState } from '../inventory/types.ts';
import {
	createBuyFromMarketSequence,
	DesirabilityScoreFn,
} from './reusable/createBuyFromMarketBehavior.ts';
import { getEntitiesReachableByEntity, walkEntityToEntity } from './reusable/travel.ts';
import { ExecutionNode } from './tree/ExecutionNode.ts';
import { InverterNode } from './tree/InverterNode.ts';
import { SelectorNode } from './tree/SelectorNode.ts';
import { SequenceNode } from './tree/SequenceNode.ts';
import { type EntityBlackboard } from './types.ts';

const filterEdibleMaterial = ({ material }: MaterialState) =>
	material.nutrition && !material.toxicity;

const getMostEdibleStateFromInventory = (inventory: Inventory) =>
	inventory
		.getAvailableItems()
		.filter(filterEdibleMaterial)
		.sort((a, b) => a.material.nutrition - b.material.nutrition)
		.shift();

const scoreFoodDesirability: DesirabilityScoreFn = (entity, _market, material) => {
	// @TODO
	// - Better prioritize which food to buy, and which market to go to
	if (entity.wallet.get() < material.value) {
		return 0;
	}
	return material.nutrition / material.value;
};

/**
 * A behavior tree for eating any food available from inventory, or to go buy food.
 */
export const feedSelf = new SequenceNode<EntityBlackboard>(
	new ExecutionNode('Hungry?', ({ entity }) => {
		const food = entity.needs.find((need) => need.id === 'food');
		if (!food || food.get() > 0.2) {
			return EventedPromise.reject();
		}
		return EventedPromise.resolve();
	}),
	new SelectorNode(
		new SequenceNode(
			new InverterNode(
				new ExecutionNode('Has no food?', ({ entity }) => {
					const hasFood = !!entity.inventory.getAvailableItems().filter(filterEdibleMaterial)
						.length;
					return hasFood ? EventedPromise.resolve() : EventedPromise.reject();
				}),
			),
			createBuyFromMarketSequence(scoreFoodDesirability),
		),
		new ExecutionNode('Eat from inventory?', ({ entity }) => {
			// @TODO
			// - Eat food over time?
			const state = getMostEdibleStateFromInventory(entity.inventory);
			if (!state) {
				return EventedPromise.reject();
			}
			entity.inventory.change(state.material, -1);
			const foodNeed = entity.needs.find((n) => n.id === 'food');
			if (!foodNeed) {
				throw new Error('Expected entity to have a need for food');
			}
			foodNeed.set(foodNeed.get() + state.material.nutrition);
			return EventedPromise.resolve();
		}),
	),
);

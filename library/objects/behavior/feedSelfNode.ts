import { EventedPromise } from '../classes/EventedPromise.ts';
import { type MarketBuildingEntity } from '../entities/entity.building.market.ts';
import { type Inventory } from '../inventory/Inventory.ts';
import { type MaterialState } from '../inventory/types.ts';
import { getEntitiesReachableByEntity, walkEntityToEntity } from './reusable/travel.ts';
import { ExecutionNode } from './tree/ExecutionNode.ts';
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
			new ExecutionNode('Has no food?', ({ entity }) => {
				// @TODO Use an inverter on "Has food"
				const hasFood = !!entity.inventory.getAvailableItems().filter(filterEdibleMaterial).length;
				return hasFood ? EventedPromise.reject() : EventedPromise.resolve();
			}),
			new ExecutionNode('Has money?', ({ entity }) => {
				// @TODO Having at least "10" money is entirely arbitrary. Should change to:
				// "enough money to buy something of nutritional value in a shop that I can reach"
				return entity.wallet.get() > 10 ? EventedPromise.resolve() : EventedPromise.reject();
			}),
			new ExecutionNode('Has market?', (blackboard) => {
				// @TODO
				// - Prioritize which food to buy, and which market to go to
				const { game, entity } = blackboard;
				const markets = getEntitiesReachableByEntity(game, entity)
					.filter((e): e is MarketBuildingEntity => e.type === 'market-stall')
					.filter((e) => e.inventory.getAvailableItems().filter(filterEdibleMaterial).length);
				if (!markets.length) {
					return EventedPromise.reject();
				}
				Object.assign(blackboard, { market: markets[0] });
				return EventedPromise.resolve();
			}),
			new ExecutionNode<EntityBlackboard & { market?: MarketBuildingEntity }>(
				'Walk to market',
				({ game, entity, market }) =>
					market ? walkEntityToEntity(game, entity, market) : EventedPromise.reject(),
			),
			new ExecutionNode<EntityBlackboard & { market?: MarketBuildingEntity }>(
				'Buy any food',
				({ entity, market }) => {
					// @TODO
					// - Prioritize better which item to buy
					// - Put the money received from entity into somebody else's pocket
					// - Buy more than one item, if money and stack space allows it
					if (!market) {
						return EventedPromise.reject();
					}
					const state = getMostEdibleStateFromInventory(market.inventory);
					if (!state) {
						return EventedPromise.reject();
					}
					if (entity.wallet.get() < state.material.value) {
						return EventedPromise.reject();
					}

					// Spend money in exchange for one of the material
					entity.wallet.set(entity.wallet.get() - state.material.value);
					market.inventory.change(state.material, -1);
					entity.inventory.change(state.material, 1);
					return EventedPromise.resolve();
				},
			),
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

import {
	EventedPromise,
	type Inventory,
	type MaterialState,
	ExecutionNode,
	InverterNode,
	SelectorNode,
	SequenceNode,
} from '../../level-1.ts';
import {
	createBuyFromMarketSequence,
	DesirabilityScoreFn,
} from './reusable/createBuyFromMarketBehavior.ts';
import { createWaitBehavior } from './reusable/createWaitBehavior.ts';
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
		// @TODO replace with Needs/moods
		const need = entity.needs.find((n) => n.id === 'food');
		if (!need) {
			return EventedPromise.reject();
		}
		return need.get() < 0.2 ? EventedPromise.resolve() : EventedPromise.reject();
	}),
	new SelectorNode(
		new SequenceNode(
			new InverterNode(
				new ExecutionNode('Has no food?', ({ entity }) => {
					const hasSupplies = !!entity.inventory.getAvailableItems().filter(filterEdibleMaterial)
						.length;
					return hasSupplies ? EventedPromise.resolve() : EventedPromise.reject();
				}),
			),
			createBuyFromMarketSequence(scoreFoodDesirability),
		),
		new SequenceNode(
			new ExecutionNode('Eat from inventory?', ({ entity }) => {
				const state = getMostEdibleStateFromInventory(entity.inventory);
				if (!state) {
					return EventedPromise.reject();
				}
				entity.$status.set(`Muching on ${state.material}`);
				entity.inventory.change(state.material, -1);
				const need = entity.needs.find((n) => n.id === 'food');
				if (!need) {
					throw new Error('Expected entity to have a need for food');
				}
				need.set(need.get() + state.material.nutrition);
				return EventedPromise.resolve();
			}),
			createWaitBehavior(500, 3000),
			new ExecutionNode('Unset status', ({ entity }) => {
				entity.$status.set(null);
				return EventedPromise.resolve();
			}),
		),
	),
);

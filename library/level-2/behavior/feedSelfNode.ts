import { MarketBuildingEntity } from '../../level-1/mod.ts';
import {
	EntityBlackboard,
	ExecutionNode,
	InverterNode,
	SelectorNode,
	SequenceNode,
	type Inventory,
	type MaterialState,
} from '../../level-1/mod.ts';
import {
	DesirabilityScoreFn,
	createBuyFromMarketSequence,
} from './reusable/nodes/createBuyFromMarketBehavior.ts';
import { createWaitBehavior } from './reusable/nodes/createWaitBehavior.ts';
import { consumeFromInventoryForNeed } from './reusable/primitives/consumeFromInventoryForNeed.ts';

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
		const need = entity.needs.find((n) => n.id === 'food');
		if (!need) {
			throw new Error(`For some reason, ${entity} is unable to feel hungry`);
		}
		if (need.get() > 0.2) {
			throw new Error(`${entity} isn't feeling hungry`);
		}
	}),
	new SelectorNode(
		new SequenceNode(
			new InverterNode(
				new ExecutionNode('Has no food?', ({ entity }) => {
					const hasSupplies = !!entity.inventory.getAvailableItems().filter(filterEdibleMaterial)
						.length;
					if (!hasSupplies) {
						throw new Error(`${entity} does not have any edibles on hand`);
					}
				}),
			),
			createBuyFromMarketSequence(
				(vendor): vendor is MarketBuildingEntity => vendor.type === 'market-stall',
				scoreFoodDesirability,
			),
		),
		new SequenceNode(
			new ExecutionNode('Eat from inventory?', async ({ entity }) => {
				const state = getMostEdibleStateFromInventory(entity.inventory);
				if (!state) {
					throw new Error(`${entity} does not have any edibles on hand`);
				}

				await consumeFromInventoryForNeed(consumeFromInventoryForNeed.EAT, entity, state.material);
			}),
			createWaitBehavior(500, 3000),
			new ExecutionNode('Unset status', ({ entity }) => {
				entity.$status.set(null);
			}),
		),
	),
);

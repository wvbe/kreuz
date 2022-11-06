import { EventedPromise } from '../classes/EventedPromise.ts';
import { type Inventory } from '../inventory/Inventory.ts';
import { type MaterialState } from '../inventory/types.ts';
import { type DesirabilityScoreFn } from './reusable/createBuyFromMarketBehavior.ts';
import { getWaterFromWell } from '../constants/blueprints.ts';
import { createWaitBehavior } from './reusable/createWaitBehavior.ts';
import { getEntitiesReachableByEntity, walkEntityToEntity } from './reusable/travel.ts';
import { ExecutionNode } from './tree/ExecutionNode.ts';
import { InverterNode } from './tree/InverterNode.ts';
import { SelectorNode } from './tree/SelectorNode.ts';
import { SequenceNode } from './tree/SequenceNode.ts';
import { type FactoryBuildingEntity } from '../entities/entity.building.factory.ts';
import { type EntityBlackboard } from './types.ts';
import { type Material } from '../inventory/Material.ts';
import { TradeOrder } from '../classes/TradeOrder.ts';
import { headOfState } from '../constants/heroes.ts';

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

export type DesirabilityRecord = {
	factory: FactoryBuildingEntity;
	material: Material;
	score: number;
};

/**
 * A behavior tree for eating any food available from inventory, or to go buy food.
 */
export const hydrateSelfBehavior = new SequenceNode<EntityBlackboard>(
	new ExecutionNode('Thirsty?', ({ entity }) => {
		// @TODO replace with Needs/moods
		const need = entity.needs.find((n) => n.id === 'water');
		if (!need) {
			return EventedPromise.reject();
		}
		return need.get() < 0.2 ? EventedPromise.resolve() : EventedPromise.reject();
	}),
	new SelectorNode(
		new SequenceNode(
			new InverterNode(
				new ExecutionNode('Has no drinks?', ({ entity }) => {
					const hasSupplies = !!entity.inventory.getAvailableItems().filter(filterDrinkableMaterial)
						.length;
					return hasSupplies ? EventedPromise.resolve() : EventedPromise.reject();
				}),
			),
			new SequenceNode<EntityBlackboard>(
				new ExecutionNode('Find a deal', (blackboard) => {
					const { game, entity } = blackboard;
					const mostDesirableDeal = getEntitiesReachableByEntity(game, entity)
						.filter((e): e is FactoryBuildingEntity => e.type === 'factory')
						.filter((factory) => factory.$blueprint.get() === getWaterFromWell)
						.reduce<DesirabilityRecord[]>(
							(records, factory) =>
								records.concat(
									factory.inventory.getAvailableItems().map(({ material, quantity }) => ({
										factory,
										material,
										score: scoreFluidDesirability(entity, factory, material, quantity),
									})),
								),
							[],
						)
						.filter((desirability) => desirability.score > 0)
						.sort((a, b) => a.score - b.score)
						.shift();

					if (!mostDesirableDeal) {
						return EventedPromise.reject();
					}
					Object.assign(blackboard, { deal: mostDesirableDeal });
					return EventedPromise.resolve();
				}),
				new ExecutionNode<EntityBlackboard & { deal?: DesirabilityRecord }>(
					'Walk to factory',
					({ game, entity, deal }) =>
						deal ? walkEntityToEntity(game, entity, deal.factory) : EventedPromise.reject(),
				),
				new ExecutionNode<EntityBlackboard & { deal?: DesirabilityRecord }>(
					'Grab water',
					({ entity, deal }) => {
						if (!deal) {
							return EventedPromise.reject();
						}

						const buyAmount = Math.min(
							// Don't buy more than what is being sold:
							deal.factory.inventory.availableOf(deal.material),
							// Buy approximately as much as necessary to fill the need 100% once,
							// but use only 30% of wealth to hoard that way:
							Math.max(
								Math.round(1 / deal.material.fluid),
								Math.floor((0.3 * entity.wallet.get()) / deal.material.value),
							),
							// Don't buy more than it can carry:
							Math.max(0, deal.material.stack - entity.inventory.availableOf(deal.material)),
						);
						const tradeOrder = new TradeOrder({
							owner1: entity,
							inventory1: entity.inventory,
							money1: buyAmount * deal.material.value,
							stacks1: [],
							owner2: headOfState,
							inventory2: deal.factory.inventory,
							money2: 0,
							stacks2: [
								{
									material: deal.material,
									quantity: buyAmount,
								},
							],
						});
						if (deal.factory.inventory.availableOf(deal.material) < 1) {
							return EventedPromise.reject();
						}
						if (entity.wallet.get() < deal.material.value) {
							return EventedPromise.reject();
						}
						try {
							tradeOrder.makeItHappen();
						} catch (e: unknown) {
							console.log((e as Error).message || e);
							return EventedPromise.reject();
						}
						console.log(
							`${entity} bought ${buyAmount} ${deal.material} from ${headOfState} for ${
								buyAmount * deal.material.value
							}`,
						);
						return EventedPromise.resolve();
					},
				),
				createWaitBehavior(1000, 3000),
			),
		),
		new SequenceNode(
			new ExecutionNode('Drink from inventory?', ({ entity }) => {
				const state = getMostDrinkableStateFromInventory(entity.inventory);
				if (!state) {
					return EventedPromise.reject();
				}
				entity.inventory.change(state.material, -1);
				const need = entity.needs.find((n) => n.id === 'water');
				if (!need) {
					throw new Error('Expected entity to have a need for water');
				}
				need.set(need.get() + state.material.fluid);
				console.log(`${entity} drank ${state.material}`);
				return EventedPromise.resolve();
			}),
			createWaitBehavior(500, 3000),
		),
	),
);

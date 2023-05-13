import {
	EventedPromise,
	type Inventory,
	type MaterialState,
	ExecutionNode,
	InverterNode,
	SelectorNode,
	SequenceNode,
	TradeOrder,
	type FactoryBuildingEntity,
	type Material,
} from '../../level-1/mod.ts';
import { getWaterFromWell } from '../blueprints.ts';
import { headOfState } from '../heroes.ts';
import { DesirabilityScoreFn } from './reusable/createBuyFromMarketBehavior.ts';
import { createWaitBehavior } from './reusable/createWaitBehavior.ts';
import { getEntitiesReachableByEntity, walkEntityToEntity } from './reusable/travel.ts';
import { EntityBlackboard } from './types.ts';
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
					({ game, entity, deal }) => {
						if (!deal) {
							return EventedPromise.reject();
						}
						entity.$status.set(`Walking to ${deal.factory}`);
						return walkEntityToEntity(game, entity, deal.factory);
					},
				),
				new ExecutionNode<EntityBlackboard & { deal?: DesirabilityRecord }>(
					'Grab water',
					({ entity, deal, game }) => {
						if (!deal) {
							return EventedPromise.reject();
						}

						entity.$status.set(`Drawing water`);
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
						const tradeOrder = new TradeOrder(
							{
								owner: entity,
								inventory: entity.inventory,
								money: buyAmount * deal.material.value,
								cargo: [],
							},
							{
								owner: headOfState,
								inventory: deal.factory.inventory,
								money: 0,
								cargo: [
									{
										material: deal.material,
										quantity: buyAmount,
									},
								],
							},
						);
						if (deal.factory.inventory.availableOf(deal.material) < 1) {
							return EventedPromise.reject();
						}
						if (entity.wallet.get() < deal.material.value) {
							return EventedPromise.reject();
						}
						try {
							tradeOrder.makeItHappen(game.time.now);
						} catch (e: unknown) {
							console.log((e as Error).message || e);
							return EventedPromise.reject();
						}
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
				entity.$status.set(`Drinking ${state.material}`);
				entity.inventory.change(state.material, -1);
				const need = entity.needs.find((n) => n.id === 'water');
				if (!need) {
					throw new Error('Expected entity to have a need for water');
				}
				need.set(need.get() + state.material.fluid);
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

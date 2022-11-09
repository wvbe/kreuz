import {
	EventedPromise,
	TradeOrder,
	type FactoryBuildingEntity,
	type MarketBuildingEntity,
	type PersonEntity,
	type Material,
	ExecutionNode,
	SequenceNode,
} from '../../../level-1.ts';

import { headOfState } from '../../heroes.ts';
import { EntityBlackboard } from '../types.ts';
import { getEntitiesReachableByEntity, walkEntityToEntity } from './travel.ts';
import { createWaitBehavior } from '../reusable/createWaitBehavior.ts';

export type DesirabilityRecord = {
	market: MarketBuildingEntity;
	material: Material;
	score: number;
};

/**
 * A function with which the attractiveness of a purchase is evaluated. AMongst others, you could
 * use this to weigh several factors:
 * - How nutritious is an item?
 * - What does it cost, and can the entity affort it?
 * - How far away is it?
 *
 * Return zero to not consider this purchase at all.
 */
export type DesirabilityScoreFn = (
	entity: PersonEntity,
	// I am lazy, so union this shit
	market: MarketBuildingEntity | FactoryBuildingEntity,
	material: Material,
	available: number,
) => number;

export function createBuyFromMarketSequence(createDesirabilityScore: DesirabilityScoreFn) {
	return new SequenceNode<EntityBlackboard>(
		new ExecutionNode('Find a deal', (blackboard) => {
			const { game, entity } = blackboard;
			const mostDesirableDeal = getEntitiesReachableByEntity(game, entity)
				.filter((e): e is MarketBuildingEntity => e.type === 'market-stall')
				.reduce<DesirabilityRecord[]>(
					(records, market) =>
						records.concat(
							market.inventory.getAvailableItems().map(({ material, quantity }) => ({
								market,
								material,
								score: createDesirabilityScore(entity, market, material, quantity),
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
			'Walk to market',
			({ game, entity, deal }) =>
				deal ? walkEntityToEntity(game, entity, deal.market) : EventedPromise.reject(),
		),
		new ExecutionNode<EntityBlackboard & { deal?: DesirabilityRecord }>(
			'Buy any food',
			({ entity, deal }) => {
				if (!deal) {
					return EventedPromise.reject();
				}

				const buyAmount = Math.min(
					// Don't buy more than what is being sold:
					deal.market.inventory.availableOf(deal.material),

					// Buy approximately as much as necessary to fill the need 100% once,
					// but use only 30% of wealth to hoard that way:
					Math.max(
						Math.round(1 / deal.material.nutrition),
						Math.floor((0.3 * entity.wallet.get()) / deal.material.value),
					),

					// Don't buy more than it can carry:
					Math.max(0, deal.material.stack - entity.inventory.availableOf(deal.material)),

					// Don't buy more than you can pay for:
					Math.floor(entity.wallet.get() / deal.material.value),
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
						inventory: deal.market.inventory,
						money: 0,
						cargo: [
							{
								material: deal.material,
								quantity: buyAmount,
							},
						],
					},
				);
				if (deal.market.inventory.availableOf(deal.material) < 1) {
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
				return EventedPromise.resolve();
			},
		),
		createWaitBehavior(1000, 3000),
	);
}

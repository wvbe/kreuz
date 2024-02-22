import {
	EntityBlackboard,
	EntityI,
	ExecutionNode,
	SequenceNode,
	TradeOrder,
	type FactoryBuildingEntity,
	type MarketBuildingEntity,
	type Material,
	type PersonEntity,
} from '@lib/core';

import { getEntitiesReachableByEntity, walkEntityToEntity } from '../travel.ts';
import { createWaitBehavior } from './createWaitBehavior.ts';
import { BehaviorError } from '@lib/core';

type VendorEntity = MarketBuildingEntity | FactoryBuildingEntity;
export type DesirabilityRecord = {
	market: VendorEntity;
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
	market: VendorEntity,
	material: Material,
	available: number,
) => number;

export function createBuyFromMarketSequence(
	sellerFilter: (entity: EntityI) => entity is VendorEntity,
	createDesirabilityScore: DesirabilityScoreFn,
) {
	return new SequenceNode<EntityBlackboard>(
		new ExecutionNode('Find a deal', (blackboard) => {
			const { game, entity } = blackboard;
			const mostDesirableDeal = getEntitiesReachableByEntity(game, entity)
				.filter(sellerFilter)
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
				throw new BehaviorError(`There wasn't an attractive deal to be made`);
			}
			Object.assign(blackboard, { deal: mostDesirableDeal });
		}),
		new ExecutionNode<EntityBlackboard & { deal?: DesirabilityRecord }>(
			'Walk to vendor',
			async ({ game, entity, deal }) => {
				if (!deal) {
					throw new BehaviorError(`There isn't a deal to be made`);
				}
				await entity.$status.set(`Walking to ${deal.market}`);
				await walkEntityToEntity(game, entity, deal.market);
			},
		),
		new ExecutionNode<EntityBlackboard & { deal?: DesirabilityRecord }>(
			'Buy any food',
			async ({ entity, deal, game }) => {
				if (!deal) {
					throw new BehaviorError(`There isn't a deal to be made`);
				}
				await entity.$status.set('Buying food');

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
						owner: deal.market.owner,
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
					throw new BehaviorError(`The required ${deal.material} isn't available at the market`);
				}
				if (entity.wallet.get() < deal.material.value) {
					throw new BehaviorError(`The buyer doesn't have enough money`);
				}

				await tradeOrder.makeItHappen(game.time.now);
			},
		),
		createWaitBehavior(1000, 3000),
	);
}

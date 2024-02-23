import {
	BehaviorTreeSignal,
	ExecutionNode,
	SequenceNode,
	TradeOrder,
	type EntityBlackboard,
	type EntityI,
	type FactoryBuildingEntity,
	type MarketBuildingEntity,
} from '@lib/core';
import {
	getMostDesirableItem,
	type DesirabilityRecord,
	type DesirabilityScoreFn,
} from '../primitives/getMostDesirableItem.ts';
import { getEntitiesReachableByEntity, walkEntityToEntity } from '../travel.ts';
import { createWaitBehavior } from './createWaitBehavior.ts';

type VendorEntity = MarketBuildingEntity | FactoryBuildingEntity;

/**
 * Makes the entity select an attractive deal, go there and make the purchase.
 *
 * Leaves a `deal` of type {@link DesirabilityRecord} onto the blackbloard.
 */
export function createBuyFromMarketBehavior(
	vendorFilter: (entity: EntityI) => entity is VendorEntity,
	createDesirabilityScore: DesirabilityScoreFn,
) {
	return new SequenceNode<EntityBlackboard>(
		new ExecutionNode('Find a deal', (blackboard) => {
			const { game, entity } = blackboard;
			const mostDesirableDeal = getMostDesirableItem(
				entity,
				getEntitiesReachableByEntity(game, entity).filter(vendorFilter),
				createDesirabilityScore,
			);

			if (!mostDesirableDeal) {
				throw new BehaviorTreeSignal(`There wasn't an attractive deal to be made`);
			}
			Object.assign(blackboard, { deal: mostDesirableDeal });
		}),
		new ExecutionNode<EntityBlackboard & { deal?: DesirabilityRecord }>(
			'Walk to vendor',
			async ({ game, entity, deal }) => {
				if (!deal) {
					throw new BehaviorTreeSignal(`There isn't a deal to be made`);
				}
				await entity.$status.set(`Walking to ${deal.market}`);
				await walkEntityToEntity(game, entity, deal.market);
			},
		),
		new ExecutionNode<EntityBlackboard & { deal?: DesirabilityRecord }>(
			'Buy any food',
			async ({ entity, deal, game }) => {
				if (!deal) {
					throw new BehaviorTreeSignal(`There isn't a deal to be made`);
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
					throw new BehaviorTreeSignal(
						`The required ${deal.material} isn't available at the market`,
					);
				}
				if (entity.wallet.get() < deal.material.value) {
					throw new BehaviorTreeSignal(`The buyer doesn't have enough money`);
				}

				await tradeOrder.makeItHappen(game.time.now);
			},
		),
		createWaitBehavior(1000, 3000),
	);
}

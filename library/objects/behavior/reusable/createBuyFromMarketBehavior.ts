import { EventedPromise } from '../../classes/EventedPromise.ts';
import { MarketBuildingEntity } from '../../entities/entity.building.market.ts';
import { PersonEntity } from '../../entities/entity.person.ts';
import { Material } from '../../inventory/Material.ts';
import { ExecutionNode } from '../tree/ExecutionNode.ts';
import { SequenceNode } from '../tree/SequenceNode.ts';
import { EntityBlackboard } from '../types.ts';
import { getEntitiesReachableByEntity, walkEntityToEntity } from './travel.ts';

type DesirabilityRecord = {
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
	market: MarketBuildingEntity,
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
				// @TODO
				// - Put the money received from entity into somebody else's pocket
				// - Buy more than one item, if money and stack space allows it
				if (!deal) {
					return EventedPromise.reject();
				}
				if (deal.market.inventory.availableOf(deal.material) < 1) {
					return EventedPromise.reject();
				}
				if (entity.wallet.get() < deal.material.value) {
					return EventedPromise.reject();
				}

				// Spend money in exchange for one of the material
				entity.wallet.set(entity.wallet.get() - deal.material.value);
				deal.market.inventory.change(deal.material, -1);
				entity.inventory.change(deal.material, 1);
				return EventedPromise.resolve();
			},
		),
	);
}

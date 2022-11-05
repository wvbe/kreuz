import { Random } from '../../classes/Random.ts';
import { MarketBuildingEntity } from '../../entities/entity.building.market.ts';
import { PersonEntity } from '../../entities/entity.person.ts';
import { Material } from '../../inventory/Material.ts';
import { ExecutionNode } from '../tree/ExecutionNode.ts';
import { EntityBlackboard } from '../types.ts';

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

const GOD = new PersonEntity('god', { x: 0, y: 0, z: Infinity });
(self as any).godEntity = GOD;

let ticker = 0;
export function createWaitBehavior(lowerBounary: number, upperBoundary: number) {
	return new ExecutionNode<EntityBlackboard>('Wait', ({ game, entity }) => {
		return game.time.wait(
			Random.between(lowerBounary, upperBoundary, entity.id, 'wait bt', ++ticker),
		);
	});
}

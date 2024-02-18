import { ExecutionNode } from '../../../level-1/behavior/ExecutionNode.ts';
import { Random } from '../../../level-1/classes/Random.ts';
import { EntityBlackboard } from '../types.ts';

let ticker = 0;
export function createWaitBehavior(lowerBounary: number, upperBoundary: number) {
	return new ExecutionNode<EntityBlackboard>('Wait', ({ game, entity }) => {
		return game.time.wait(
			Random.between(lowerBounary, upperBoundary, entity.id, 'wait bt', ++ticker),
		);
	});
}

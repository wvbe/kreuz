import { Random, ExecutionNode, EntityBlackboard } from '../../../../level-1/mod.ts';

let ticker = 0;
export function createWaitBehavior(lowerBounary: number, upperBoundary: number) {
	return new ExecutionNode<EntityBlackboard>('Wait', ({ game, entity }) => {
		return game.time.wait(
			Random.between(lowerBounary, upperBoundary, entity.id, 'wait bt', ++ticker),
		);
	});
}

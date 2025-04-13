import { Random } from '../../../../level-1/classes/Random';
import { ExecutionNode } from '../../../../level-1/ecs/components/behaviorComponent/ExecutionNode';
import { type EntityBlackboard } from '../../../../level-1/ecs/components/behaviorComponent/types';
import { eventLogComponent } from '../../../../level-1/ecs/components/eventLogComponent';

let ticker = 0;

export function createWaitBehavior(
	lowerBounary: number,
	upperBoundary: number,
	statusUpdate?: string | null,
) {
	return new ExecutionNode<EntityBlackboard>(
		'Wait',
		async ({ game, entity }: EntityBlackboard) => {
			if (statusUpdate && eventLogComponent.test(entity)) {
				await entity.events.add(statusUpdate);
			}
			const timeout = Math.round(
				Random.between(lowerBounary, upperBoundary, entity.id, 'wait bt', ++ticker),
			);
			await game.time.wait(timeout);
		},
	);
}

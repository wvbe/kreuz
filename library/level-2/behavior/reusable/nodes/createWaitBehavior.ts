import { EcsComponent } from '@lib/core';
import { rejectBehaviorTreeWhenMissingEcsComponent } from '@lib/core';
import { statusComponent } from '@lib/core';
import { EcsEntity } from '@lib/core';
import { Random, ExecutionNode, EntityBlackboard } from '@lib/core';

let ticker = 0;

export function createWaitBehavior(
	lowerBounary: number,
	upperBoundary: number,
	statusUpdate?: string | null,
) {
	return new ExecutionNode<EntityBlackboard>('Wait', async ({ game, entity }) => {
		rejectBehaviorTreeWhenMissingEcsComponent(entity, [statusComponent]);

		if (!statusComponent.test(entity)) {
			return;
		}

		if (statusUpdate !== undefined) {
			await entity.$status.push(statusUpdate);
		}
		const timeout = Math.round(
			Random.between(lowerBounary, upperBoundary, entity.id, 'wait bt', ++ticker),
		);
		await game.time.wait(timeout);
	});
}

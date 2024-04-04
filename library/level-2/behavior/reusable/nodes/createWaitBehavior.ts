import {
	EntityBlackboard,
	ExecutionNode,
	Random,
	rejectBehaviorTreeWhenMissingEcsComponent,
	eventLogComponent,
} from '@lib/core';

let ticker = 0;

export function createWaitBehavior(
	lowerBounary: number,
	upperBoundary: number,
	statusUpdate?: string | null,
) {
	return new ExecutionNode<EntityBlackboard>('Wait', async ({ game, entity }) => {
		if (statusUpdate && eventLogComponent.test(entity)) {
			await entity.events.add(statusUpdate);
		}
		const timeout = Math.round(
			Random.between(lowerBounary, upperBoundary, entity.id, 'wait bt', ++ticker),
		);
		await game.time.wait(timeout);
	});
}

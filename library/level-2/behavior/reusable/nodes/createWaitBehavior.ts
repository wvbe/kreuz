import { Random, ExecutionNode, EntityBlackboard } from '@lib/core';

let ticker = 0;
export function createWaitBehavior(
	lowerBounary: number,
	upperBoundary: number,
	statusUpdate?: string | null,
) {
	return new ExecutionNode<EntityBlackboard>('Wait', async ({ game, entity }) => {
		if (statusUpdate !== undefined) {
			await entity.$status.set(statusUpdate);
		}
		const timeout = Math.round(
			Random.between(lowerBounary, upperBoundary, entity.id, 'wait bt', ++ticker),
		);
		await game.time.wait(timeout);
	});
}

import { BehaviorTreeSignal, EntityBlackboard, ExecutionNode } from '@lib/core';

export function createJobWorkBehavior() {
	return new ExecutionNode<EntityBlackboard>('Do the work', async (blackboard) => {
		const job = blackboard.game.jobs
			.forEntity(blackboard.entity)
			.map((job) => job())
			.filter(({ score }) => score > 0)
			.sort((a, b) => a.score - b.score)
			.pop(); // or pop?

		if (!job) {
			throw new BehaviorTreeSignal(`There are no factories in need for workers`);
		}

		await job.execute();
	});
}

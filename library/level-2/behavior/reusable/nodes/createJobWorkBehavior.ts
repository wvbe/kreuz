import { BehaviorTreeSignal, EntityBlackboard, ExecutionNode } from '@lib/core';

export function createJobWorkBehavior() {
	return new ExecutionNode<EntityBlackboard>('Do the work', async (blackboard) => {
		const job = blackboard.game.jobs
			.filter((job) => job.vacancies > 0)
			.map((job) => ({
				vacancy: job,
				desirability: job.score(blackboard),
			}))
			.filter(({ desirability }) => desirability > 0)
			.sort((a, b) => a.desirability - b.desirability)
			.pop(); // or pop?

		if (!job) {
			throw new BehaviorTreeSignal(`There are no factories in need for workers`);
		}

		await job.vacancy.doJob(blackboard);
	});
}

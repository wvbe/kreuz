import { BehaviorTreeSignal, EntityBlackboard, ExecutionNode } from '@lib/core';

export function createJobWorkBehavior() {
	return new ExecutionNode<EntityBlackboard>('Do the work', async (blackboard) => {
		const match = blackboard.game.jobs
			.filter((job) => job.vacancies > 0)
			.map((job) => ({
				job: job,
				desirability: job.score(blackboard),
			}))
			.filter(({ desirability }) => desirability > 0)
			.sort((a, b) => a.desirability - b.desirability)
			.pop(); // or pop?

		if (!match) {
			throw new BehaviorTreeSignal(`There are no factories in need for workers`);
		}

		await match.job.doJob(blackboard);
	});
}

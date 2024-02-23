import {
	type FactoryBuildingEntity,
	ExecutionNode,
	SequenceNode,
	EntityBlackboard,
	BehaviorTreeSignal,
} from '@lib/core';
import { getEntitiesReachableByEntity, walkEntityToEntity } from '../travel.ts';
import { black } from 'https://deno.land/std@0.106.0/fmt/colors.ts';

export function createJobWorkBehavior() {
	return new ExecutionNode<EntityBlackboard>('Do the work', async (blackboard) => {
		const job = blackboard.game.jobs
			.filter((job) => job.$vacancies.get() > 0)
			.map((job) => ({
				vacancy: job,
				desirability: job.calculateDesirability(blackboard),
			}))
			.filter(({ desirability }) => desirability > 0)
			.sort((a, b) => a.desirability - b.desirability)
			.pop(); // or pop?
		// console.log('New job: ' + job?.desirability);

		if (!job) {
			throw new BehaviorTreeSignal(`There are no factories in need for workers`);
		}

		await job.vacancy.doJob(blackboard);
	});
}

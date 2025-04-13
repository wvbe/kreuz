import { BehaviorTreeSignal } from '../../../../level-1/ecs/components/behaviorComponent/BehaviorTreeSignal';
import { ExecutionNode } from '../../../../level-1/ecs/components/behaviorComponent/ExecutionNode';
import { type EntityBlackboard } from '../../../../level-1/ecs/components/behaviorComponent/types';

export function createJobWorkBehavior() {
	return new ExecutionNode<EntityBlackboard>(
		'Do the work',
		async (blackboard: EntityBlackboard) => {
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
		},
	);
}

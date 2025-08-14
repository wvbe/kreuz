import { assertEcsComponents } from '../../../core/ecs/assert';
import { BehaviorTreeSignal } from '../../../core/ecs/components/behaviorComponent/BehaviorTreeSignal';
import { ExecutionNode } from '../../../core/ecs/components/behaviorComponent/ExecutionNode';
import { type EntityBlackboard } from '../../../core/ecs/components/behaviorComponent/types';
import { getTileAtLocation } from '../../../core/ecs/components/location/getTileAtLocation';
import { locationComponent } from '../../../core/ecs/components/locationComponent';

export function createJobWorkBehavior() {
	return new ExecutionNode<EntityBlackboard>(
		'Do the work',
		async (blackboard: EntityBlackboard) => {
			assertEcsComponents(blackboard.entity, [locationComponent]);

			// Throw if this entity is not in a valid tile
			getTileAtLocation(blackboard.entity.location.get());

			// const zzz = findHopsToSelectedPatheables(startingTile, (tile) => {
			// 	return FindInPatheableOrderResult.INCLUDE;
			// });
			const job = blackboard.game.jobs
				.forEntity(blackboard.entity)
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

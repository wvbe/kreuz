import { EcsComponent } from '../../classes/EcsComponent';
import { EcsEntity } from '../../types';
import { BehaviorTreeSignal } from './BehaviorTreeSignal';

/**
 * @deprecated Use `EcsComponent.test` instead
 * @deprecated Or maybe don't start this branch of the behavior tree in the first place
 */
export function rejectBehaviorTreeWhenMissingEcsComponent<G extends EcsComponent<any, any>>(
	entity: EcsEntity,
	components: G[],
): asserts entity is EcsEntity<G> {
	for (const component of components) {
		if (!component.test(entity)) {
			throw new BehaviorTreeSignal('Entity does not have the required component');
		}
	}
}

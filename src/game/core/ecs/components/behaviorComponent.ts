import { Event } from '../../events/Event';
import { EventedValue } from '../../events/EventedValue';
import { EcsComponent } from '../classes/EcsComponent';
import { BehaviorTreeNodeI, EntityBlackboard } from './behaviorComponent/types';

type PersonEntityBehavior = BehaviorTreeNodeI<EntityBlackboard> | null;

/**
 * Entities with this component may participate in the behavior tree driver for jobs etc.
 */
export const behaviorComponent = new EcsComponent<
	{ behavior: BehaviorTreeNodeI<EntityBlackboard> | null },
	{
		/**
		 * Contains the root behavior tree node of this entities current behavior.
		 */
		$behavior: EventedValue<PersonEntityBehavior | null>;
		/**
		 * An event that gets emitted when an external force interrupts the current behavior. This
		 * will force the behavior tree to re-run, hopefully landing at a better node.
		 *
		 * @example
		 * An entity gets critically hungry and must stop its current behavior to eat.
		 */
		$behaviorInterrupt: Event;
	}
>(
	(entity) =>
		entity.$behavior instanceof EventedValue && entity.$behaviorInterrupt instanceof Event,
	(entity, options) => {
		Object.assign(entity, {
			$behavior: new EventedValue<PersonEntityBehavior | null>(
				options.behavior,
				`behaviorComponent $behavior`,
			),
			$behaviorInterrupt: new Event(`behaviorComponent $behaviorInterrupt`),
		});
	},
);

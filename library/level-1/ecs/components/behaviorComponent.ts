import { EntityBlackboard } from './behaviorComponent/types.ts';
import { BehaviorTreeNodeI } from './behaviorComponent/types.ts';
import { EventedValue } from '../../events/EventedValue.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';
import { Event } from '../../events/Event.ts';

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
				{
					fromJson: async (context, id) =>
						id === null ? null : context.behaviorNodes.get(id as string),
					toJson: (context, node) => (node === null ? null : context.behaviorNodes.key(node)),
				},
			),
			$behaviorInterrupt: new Event(`behaviorComponent $behaviorInterrupt`),
		});
	},
);

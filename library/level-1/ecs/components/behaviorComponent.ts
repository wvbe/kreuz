import { EntityBlackboard } from './behaviorComponent/types.ts';
import { BehaviorTreeNodeI } from './behaviorComponent/types.ts';
import { EventedValue } from '../../events/EventedValue.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

type PersonEntityBehavior = BehaviorTreeNodeI<EntityBlackboard> | null;

export const behaviorComponent = new EcsComponent<
	{ behavior: BehaviorTreeNodeI<EntityBlackboard> | null },
	{ $behavior: EventedValue<PersonEntityBehavior | null> }
>(
	(entity) => entity.$behavior instanceof EventedValue,
	(entity, options) => {
		Object.assign(entity, {
			$behavior: new EventedValue<PersonEntityBehavior | null>(
				options.behavior,
				`behaviorComponent $behavior`,
				{
					fromJson: async (context, id) => context.behaviorNodes.itemFromSaveJson(id as string),
					toJson: (context, node) => context.behaviorNodes.itemToSaveJson(node),
				},
			),
		});
	},
);

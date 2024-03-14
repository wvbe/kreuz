import { EntityBlackboard } from '../../behavior/types.ts';
import { BehaviorTreeNodeI } from '../../behavior/types.ts';
import { EventedValue } from '../../events/EventedValue.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

type PersonEntityBehavior = BehaviorTreeNodeI<EntityBlackboard> | null;

export const behaviorComponent = new EcsComponent<
	{ behavior?: string },
	{ $behavior: EventedValue<PersonEntityBehavior | null> }
>(
	(entity) => entity.$behavior instanceof EventedValue,
	(entity, options) => {
		Object.assign(entity, {
			$behavior: new EventedValue<PersonEntityBehavior | null>(
				null,
				`behaviorComponent $behavior`,
				{
					fromJson: async (context, id) => context.behaviorNodes.itemFromSaveJson(id as string),
					toJson: (context, node) => context.behaviorNodes.itemToSaveJson(node),
				},
			),
		});
	},
);

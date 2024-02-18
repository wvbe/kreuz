import { BehaviorTreeNodeI } from '../../level-1/behavior/types.ts';
import { type PersonEntityBehavior } from '../../level-1/entities/entity.person.ts';
import { Registry } from '../../level-1/classes/Registry.ts';
import { civvyBehavior } from './civvyBehavior.ts';
import { feedSelf } from './feedSelfNode.ts';
import { hydrateSelfBehavior } from './hydrateSelfBehavior.ts';
import { loiterNode } from './loiterNode.ts';
import { workInFactory } from './workInFactoryNode.ts';

export const behaviorNodeRegistry = new Registry<PersonEntityBehavior>();

let identifier = 0;
(function recurse(behaviorNode: BehaviorTreeNodeI<Record<string, unknown>>) {
	if (!behaviorNodeRegistry.contains(behaviorNode)) {
		behaviorNodeRegistry.set(`node-${identifier++}`, behaviorNode);
	}
	behaviorNode.children?.forEach(recurse);
})({
	children: [civvyBehavior, feedSelf, hydrateSelfBehavior, loiterNode, workInFactory],
} as BehaviorTreeNodeI<Record<string, unknown>>);

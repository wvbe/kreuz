import { feedSelf } from './feedSelfNode.ts';
import { loiterNode } from './loiterNode.ts';
import { SelectorNode } from './tree/SelectorNode.ts';
import { EntityBlackboard } from './types.ts';
import { workInFactory } from './workInFactoryNode.ts';

export const civvyBehavior = new SelectorNode<EntityBlackboard>(
	feedSelf,
	workInFactory,
	loiterNode,
);

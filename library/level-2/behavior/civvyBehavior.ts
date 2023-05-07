import { RandomSelectorNode } from '../../level-1/mod.ts';
import { feedSelf } from './feedSelfNode.ts';
import { hydrateSelfBehavior } from './hydrateSelfBehavior.ts';
import { loiterNode } from './loiterNode.ts';
import { transportMaterial } from './transportMaterials.ts';
import { EntityBlackboard } from './types.ts';
import { workInFactory } from './workInFactoryNode.ts';

let i = 0;

export const civvyBehavior = new RandomSelectorNode<EntityBlackboard>(
	(blackboard) => [blackboard.entity.id, 'rnd', ++i],
	feedSelf,
	hydrateSelfBehavior,
	transportMaterial,
	workInFactory,
	loiterNode,
);

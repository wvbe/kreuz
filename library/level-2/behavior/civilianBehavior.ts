import { EntityBlackboard, RandomSelectorNode } from '@lib/core';

import { createLoiterBehavior } from './reusable/nodes/createLoiterBehavior.ts';
import { transportMaterial } from './transportMaterials.ts';
import { workInFactory } from './workInFactoryNode.ts';
import { createConsumeBehavior } from './reusable/nodes/createConsumeBehavior.ts';
import { JobSelectorNode } from '../../level-1/behavior/JobSelectorNode.ts';

let i = 0;

export const civilianBehavior = new RandomSelectorNode<EntityBlackboard>(
	(blackboard) => [blackboard.entity.id, 'rnd', ++i],
	createConsumeBehavior(createConsumeBehavior.EAT),
	createConsumeBehavior(createConsumeBehavior.DRINK),
	transportMaterial,
	new JobSelectorNode(),
	createLoiterBehavior(),
);

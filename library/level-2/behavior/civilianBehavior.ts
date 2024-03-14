import { EntityBlackboard, RandomSelectorNode } from '@lib/core';

import { createConsumeBehavior } from './reusable/nodes/createConsumeBehavior.ts';
import { createJobWorkBehavior } from './reusable/nodes/createJobWorkBehavior.ts';
import { createLoiterBehavior } from './reusable/nodes/createLoiterBehavior.ts';
// import { transportMaterial } from './transportMaterials.ts';

let i = 0;

export const civilianBehavior = new RandomSelectorNode<EntityBlackboard>(
	(blackboard) => [blackboard.entity.id, 'rnd', ++i, blackboard.game.time.now],
	createConsumeBehavior(createConsumeBehavior.EAT),
	createConsumeBehavior(createConsumeBehavior.DRINK),
	// transportMaterial,
	createJobWorkBehavior(),
	createLoiterBehavior(),
);

import { EntityBlackboard, RandomSelectorNode } from '@lib/core';
import { createJobWorkBehavior } from './reusable/nodes/createJobWorkBehavior.ts';
import { createLoiterBehavior } from './reusable/nodes/createLoiterBehavior.ts';
import { SelectorNode } from '@lib/core';
// import { transportMaterial } from './transportMaterials.ts';

let i = 0;

export const civilianBehavior = new SelectorNode<EntityBlackboard>(
	createJobWorkBehavior(),
	createLoiterBehavior(),
);

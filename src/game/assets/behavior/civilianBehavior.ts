import { SelectorNode } from '../../core/ecs/components/behaviorComponent/SelectorNode';
import { type EntityBlackboard } from '../../core/ecs/components/behaviorComponent/types';
import { createJobWorkBehavior } from './reusable/nodes/createJobWorkBehavior';
import { createLoiterBehavior } from './reusable/nodes/createLoiterBehavior';
// import { transportMaterial } from './transportMaterials';

let i = 0;

export const civilianBehavior = new SelectorNode<EntityBlackboard>(
	createJobWorkBehavior(),
	createLoiterBehavior(),
);

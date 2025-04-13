import { SelectorNode } from '../../level-1/ecs/components/behaviorComponent/SelectorNode';
import { type EntityBlackboard } from '../../level-1/ecs/components/behaviorComponent/types';
import { createJobWorkBehavior } from './reusable/nodes/createJobWorkBehavior';
import { createLoiterBehavior } from './reusable/nodes/createLoiterBehavior';
// import { transportMaterial } from './transportMaterials';

let i = 0;

export const civilianBehavior = new SelectorNode<EntityBlackboard>(
	createJobWorkBehavior(),
	createLoiterBehavior(),
);

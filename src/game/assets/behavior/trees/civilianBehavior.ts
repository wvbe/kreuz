import { SelectorNode } from '../../../core/ecs/components/behaviorComponent/SelectorNode';
import { type EntityBlackboard } from '../../../core/ecs/components/behaviorComponent/types';
import { createJobWorkBehavior } from '../execution/createJobWorkBehavior';
import { createLoiterBehavior } from '../selectors/createLoiterBehavior';
// import { transportMaterial } from './transportMaterials';

let i = 0;

export const civilianBehavior = new SelectorNode<EntityBlackboard>(
	createJobWorkBehavior(),
	createLoiterBehavior(),
);

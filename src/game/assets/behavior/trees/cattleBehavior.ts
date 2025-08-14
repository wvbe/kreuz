import { SelectorNode } from '../../../core/ecs/components/behaviorComponent/SelectorNode';
import { type EntityBlackboard } from '../../../core/ecs/components/behaviorComponent/types';
import { createEatFromRawMaterial } from '../execution/createEatFromRawMaterial';
import { createLoiterBehavior } from '../selectors/createLoiterBehavior';
// import { transportMaterial } from './transportMaterials';

let i = 0;

export const cattleBehavior = new SelectorNode<EntityBlackboard>(
	createEatFromRawMaterial(),
	createLoiterBehavior(),
);

import { ExecutionNode } from '../../level-1/behavior/ExecutionNode.ts';
import { InverterNode } from '../../level-1/behavior/InverterNode.ts';
import { RandomSelectorNode } from '../../level-1/behavior/RandomSelectorNode.ts';
import { SelectorNode } from '../../level-1/behavior/SelectorNode.ts';
import { SequenceNode } from '../../level-1/behavior/SequenceNode.ts';
import { EventedPromise } from '../../level-1/classes/EventedPromise.ts';
import { TradeOrder } from '../../level-1/classes/TradeOrder.ts';
import { FactoryBuildingEntity } from '../../level-1/entities/entity.building.factory.ts';
import { Inventory } from '../../level-1/inventory/Inventory.ts';
import { Material } from '../../level-1/inventory/Material.ts';
import { MaterialState } from '../../level-1/inventory/types.ts';
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

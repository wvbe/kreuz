import { Command } from '../level-1/classes/Command';
import { StrictMap } from '../level-1/classes/StrictMap';
import {
	BehaviorTreeNodeI,
	EntityBlackboard,
} from '../level-1/ecs/components/behaviorComponent/types';
import { Blueprint } from '../level-1/ecs/components/productionComponent/Blueprint';
import { GameAssets } from '../level-1/Game';
import { Material } from '../level-1/inventory/Material';
import * as bt from './behavior';
import * as blueprints from './blueprints';
import * as commands from './commands';
import * as materials from './materials';

/**
 * The default assets passed to most if not all game instances.
 */
export const DEFAULT_ASSETS: GameAssets = {
	behaviorNodes: new StrictMap<BehaviorTreeNodeI<EntityBlackboard>>(),
	materials: new StrictMap<Material>(),
	blueprints: new StrictMap<Blueprint>(),
	commands: new StrictMap<Command<EntityBlackboard>>(),
};

let identifier = 0;
(function recurse(
	registry: StrictMap<BehaviorTreeNodeI<EntityBlackboard>>,
	behaviorNode: BehaviorTreeNodeI<Record<string, unknown>>,
) {
	if (!registry.contains(behaviorNode)) {
		registry.set(`bt-${identifier++}`, behaviorNode);
	}
	behaviorNode.children?.forEach((child) => recurse(registry, child));
})(DEFAULT_ASSETS.behaviorNodes, {
	children: Object.values(bt),
} as unknown as BehaviorTreeNodeI<EntityBlackboard>);

Object.entries(materials as Record<string, Material>).forEach(([key, item]) =>
	DEFAULT_ASSETS.materials.set(key, item),
);

Object.entries(blueprints as Record<string, Blueprint>).forEach(([key, item]) =>
	DEFAULT_ASSETS.blueprints.set(key, item),
);

Object.entries(commands as Record<string, Command<EntityBlackboard>>).forEach(([key, item]) =>
	DEFAULT_ASSETS.commands.set(key, item),
);

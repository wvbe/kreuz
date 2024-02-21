import {
	Blueprint,
	Material,
	Registry,
	type BehaviorTreeNodeI,
	type EntityBlackboard,
	type GameAssets,
} from '@lib/core';

import * as bt from './behavior.ts';
import * as blueprints from './blueprints.ts';
import * as materials from './materials.ts';

/**
 * The default assets passed to most if not all game instances.
 */
export const DEFAULT_ASSETS: GameAssets = {
	behaviorNodes: new Registry<BehaviorTreeNodeI<EntityBlackboard>>(),
	materials: new Registry<Material>(),
	blueprints: new Registry<Blueprint>(),
};

let identifier = 0;
(function recurse(
	registry: Registry<BehaviorTreeNodeI<EntityBlackboard>>,
	behaviorNode: BehaviorTreeNodeI<Record<string, unknown>>,
) {
	if (!registry.contains(behaviorNode)) {
		registry.set(`bt-${identifier++}`, behaviorNode);
	}
	behaviorNode.children?.forEach((child) => recurse(registry, child));
})(DEFAULT_ASSETS.behaviorNodes, {
	children: Object.values(bt),
} as BehaviorTreeNodeI<Record<string, unknown>>);

Object.entries(materials as Record<string, Material>).forEach(([key, item]) =>
	DEFAULT_ASSETS.materials.set(key, item),
);

Object.entries(blueprints as Record<string, Blueprint>).forEach(([key, item]) =>
	DEFAULT_ASSETS.blueprints.set(key, item),
);

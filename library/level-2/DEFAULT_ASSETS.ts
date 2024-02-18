import {
	type BehaviorTreeNodeI,
	type EntityBlackboard,
	Registry,
	type GameAssets,
} from '../level-1/mod.ts';

import * as bt from './behavior.ts';

/**
 * The default assets passed to most if not all game instances.
 */
export const DEFAULT_ASSETS: GameAssets = {
	behaviorNodes: new Registry<BehaviorTreeNodeI<EntityBlackboard>>(),
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

// Behavior tree
import { civvyBehavior } from './behavior/civvyBehavior.ts';
import { feedSelf } from './behavior/feedSelfNode.ts';
import { hydrateSelfBehavior } from './behavior/hydrateSelfBehavior.ts';
import { loiterNode } from './behavior/loiterNode.ts';
import { workInFactory } from './behavior/workInFactoryNode.ts';
export const bt = {
	civvyBehavior,
	feedSelf,
	hydrateSelfBehavior,
	loiterNode,
	workInFactory,
};

// Constants
export * as blueprints from './blueprints.ts';
export * as heroes from './heroes.ts';

// Data & generators
export * from './constants/names.ts';

import {
	Random,
	ExecutionNode,
	SelectorNode,
	SequenceNode,
	EntityBlackboard,
	BehaviorError,
} from '@lib/core';
import { createWaitBehavior } from './createWaitBehavior.ts';

// Some "entropy" lolz0r
let ticker = 0;

export function createLoiterBehavior() {
	return new SelectorNode<EntityBlackboard>(
		new SequenceNode(
			new ExecutionNode('Wander', async ({ game, entity }) => {
				if ((entity.needs.find((need) => need.id === 'energy')?.get() || 0) < 0.2) {
					throw new BehaviorError(`${entity} is too tired to wander around`);
				}
				await entity.$status.set('Wandering around…');
				const start = game.terrain.getTileEqualToLocation(entity.$$location.get());
				const destination = Random.fromArray(
					[start, ...game.terrain.selectClosestTiles(start, 5)],
					entity.id,
					'loiter walk',
					++ticker,
				);
				await entity.walkToTile(destination);
			}),
			createWaitBehavior(1000, 3000),
		),
		createWaitBehavior(1000, 3000, null),
	);
}

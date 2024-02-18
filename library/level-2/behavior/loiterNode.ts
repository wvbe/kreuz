import { ExecutionNode } from '../../level-1/behavior/ExecutionNode.ts';
import { SelectorNode } from '../../level-1/behavior/SelectorNode.ts';
import { SequenceNode } from '../../level-1/behavior/SequenceNode.ts';
import { EventedPromise } from '../../level-1/classes/EventedPromise.ts';
import { Random } from '../../level-1/classes/Random.ts';
import { type EntityBlackboard } from './types.ts';

// Some "entropy" lolz0r
let ticker = 0;

export const loiterNode = new SelectorNode<EntityBlackboard>(
	new SequenceNode(
		new ExecutionNode('Wander', ({ game, entity }) => {
			if ((entity.needs.find((need) => need.id === 'energy')?.get() || 0) < 0.2) {
				return EventedPromise.reject();
			}
			entity.$status.set('Wandering around…');
			const start = game.terrain.getTileEqualToLocation(entity.$$location.get());
			const destination = Random.fromArray(
				[start, ...game.terrain.selectClosestTiles(start, 5)],
				entity.id,
				'loiter walk',
				++ticker,
			);
			return entity.walkToTile(destination);
		}),
		new ExecutionNode('Pause', ({ game, entity }) => {
			return game.time.wait(Random.between(1000, 3000, entity.id, 'loiter wait', ++ticker));
		}),
	),
	new ExecutionNode('Wait', ({ game, entity }) => {
		entity.$status.set(null);
		return game.time.wait(Random.between(1000, 3000, entity.id, 'loiter wait', ++ticker));
	}),
);

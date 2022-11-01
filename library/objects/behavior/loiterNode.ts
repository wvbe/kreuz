import { EventedPromise } from '../classes/EventedPromise.ts';
import { Random } from '../classes/Random.ts';
import { type PersonEntity } from '../entities/entity.person.ts';
import type Game from '../Game.ts';
import { ExecutionNode } from './tree/ExecutionNode.ts';
import { SequenceNode } from './tree/SequenceNode.ts';
import { SelectorNode } from './tree/SelectorNode.ts';
import { type EntityBlackboard } from './types.ts';

// Some "entropy" lolz0r
let ticker = 0;

export const loiterNode = new SelectorNode<EntityBlackboard>(
	new SequenceNode(
		new ExecutionNode('Wander', ({ game, entity }) => {
			if ((entity.needs.find((need) => need.id === 'energy')?.get() || 0) < 0.2) {
				return EventedPromise.reject();
			}
			const start = game.terrain.getTileEqualToLocation(entity.$$location.get());
			const destination = Random.fromArray(
				[start, ...game.terrain.selectClosestTiles(start, 50)],
				entity.id,
				'loiter walk',
				++ticker,
			);
			return entity.walkToTile(destination);
		}),
		new ExecutionNode('Pause', ({ game, entity }) => {
			return game.time.wait(Random.between(1000, 10000, entity.id, 'loiter wait', ++ticker));
		}),
	),
	new ExecutionNode('Wait', ({ game, entity }) => {
		return game.time.wait(Random.between(1000, 10000, entity.id, 'loiter wait', ++ticker));
	}),
);

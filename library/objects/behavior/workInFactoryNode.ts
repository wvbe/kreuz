import { EventedPromise } from '../classes/EventedPromise.ts';
import { type FactoryBuildingEntity } from '../entities/entity.building.factory.ts';
import { getEntitiesReachableByEntity, walkEntityToEntity } from './reusable/travel.ts';
import { ExecutionNode } from './tree/ExecutionNode.ts';
import { SequenceNode } from './tree/SequenceNode.ts';
import { type EntityBlackboard } from './types.ts';

export const workInFactory = new SequenceNode<EntityBlackboard>(
	new ExecutionNode('Find', (blackboard) => {
		// @TODO Make function cheap in case entity is already on the same location as a factory.
		const { game, entity } = blackboard;
		const factories = getEntitiesReachableByEntity(game, entity)
			.filter((e): e is FactoryBuildingEntity => e.type === 'factory')
			.filter((e) => e.$blueprint.get());
		if (!factories.length) {
			return EventedPromise.reject();
		}

		// @TODO
		// - Select factories that have worker space left, and
		// - ... preferably already have their ingredient materials, and
		// - ... preferably have space to put the product, or demand for it
		// Test this prioritization!

		Object.assign(blackboard, { factory: factories[0] });

		return EventedPromise.resolve();
	}),
	new ExecutionNode<EntityBlackboard & { factory: FactoryBuildingEntity }>(
		'Walk',
		({ game, entity, factory }) => {
			if (!factory) {
				return EventedPromise.reject();
			}
			return walkEntityToEntity(game, entity, factory);
		},
	),
	new ExecutionNode<EntityBlackboard & { factory: FactoryBuildingEntity }>(
		'Work',
		({ entity, factory }) => {
			const promise = new EventedPromise();

			// Add worker, and remove it again when worker moves away
			factory.$workers.add(entity);
			entity.$$location.once(() => {
				factory.$workers.remove(entity);
			});

			// Finish job when one work cycle completes
			factory.$$progress.onceAbove(1, () => promise.resolve(), true);

			return promise;
		},
	),
);

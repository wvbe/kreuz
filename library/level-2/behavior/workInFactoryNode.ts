import {
	EventedPromise,
	type FactoryBuildingEntity,
	ExecutionNode,
	SequenceNode,
} from '../../level-1.ts';
import { getEntitiesReachableByEntity, walkEntityToEntity } from './reusable/travel.ts';
import { type EntityBlackboard } from './types.ts';

export const workInFactory = new SequenceNode<EntityBlackboard>(
	new ExecutionNode('Find', (blackboard) => {
		// @TODO Make function cheap in case entity is already on the same location as a factory.
		const { game, entity } = blackboard;
		const factories = getEntitiesReachableByEntity(game, entity)
			.filter((entity): entity is FactoryBuildingEntity => entity.type === 'factory')
			.filter((factory) => {
				const blueprint = factory.$blueprint.get();
				if (!blueprint) {
					return false;
				}
				if (factory.$workers.length >= factory.options.maxWorkers) {
					return false;
				}
				if (
					blueprint.ingredients.some(
						({ material, quantity }) => factory.inventory.availableOf(material) < quantity,
					)
				) {
					// Ignore factories that do not have enough materials to produce
					return false;
				}
				return true;
			})
			.map((factory) => ({
				factory,
				distance: factory.$$location.get().euclideanDistanceTo(entity.$$location.get()),
			}))
			.sort((a, b) => a.distance - b.distance);
		if (!factories.length) {
			return EventedPromise.reject();
		}

		// @TODO
		// - Select factories that have worker space left, and
		// - ... preferably already have their ingredient materials, and
		// - ... preferably have space to put the product, or demand for it
		// Test this prioritization!

		Object.assign(blackboard, { factory: factories[0].factory });

		return EventedPromise.resolve();
	}),
	new ExecutionNode<EntityBlackboard & { factory: FactoryBuildingEntity }>(
		'Walk',
		({ game, entity, factory }) => {
			if (!factory) {
				return EventedPromise.reject();
			}
			entity.$status.set(`Going to ${factory} for work`);
			return walkEntityToEntity(game, entity, factory);
		},
	),
	new ExecutionNode<EntityBlackboard & { factory: FactoryBuildingEntity }>(
		'Work',
		({ entity, factory }) => {
			const promise = new EventedPromise();

			// Add worker, and remove it again when worker moves away
			if (!factory.$workers.includes(entity)) {
				if (factory.$workers.length >= factory.options.maxWorkers) {
					// Aww shucks, somebody else took our spot before we could make it to the factory!
					return EventedPromise.reject();
				}
				factory.$workers.add(entity);
				entity.$$location.once(() => {
					factory.$workers.remove(entity);
				});
			}
			entity.$status.set(`Working in ${factory}`);
			// Finish job when one work cycle completes
			factory.$$progress.onceAbove(1, () => promise.resolve(), true);

			return promise;
		},
	),
	new ExecutionNode('Unset status', ({ entity }) => {
		entity.$status.set(null);
		return EventedPromise.resolve();
	}),
);

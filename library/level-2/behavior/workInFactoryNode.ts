import {
	type FactoryBuildingEntity,
	ExecutionNode,
	SequenceNode,
	EntityBlackboard,
} from '@lib/core';
import { getEntitiesReachableByEntity, walkEntityToEntity } from './reusable/travel.ts';

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
			throw new Error(`There are no factories in need for workers`);
		}

		// @TODO
		// - Select factories that have worker space left, and
		// - ... preferably already have their ingredient materials, and
		// - ... preferably have space to put the product, or demand for it
		// Test this prioritization!

		Object.assign(blackboard, { factory: factories[0].factory });
	}),
	new ExecutionNode<EntityBlackboard & { factory: FactoryBuildingEntity }>(
		'Walk',
		async ({ game, entity, factory }) => {
			if (!factory) {
				throw new Error(`Theres no factory to go to`);
			}
			await entity.$status.set(`Going to ${factory} for work`);
			await walkEntityToEntity(game, entity, factory);
		},
	),
	new ExecutionNode<EntityBlackboard & { factory: FactoryBuildingEntity }>(
		'Work',
		async ({ entity, factory }) => {
			// Add worker, and remove it again when worker moves away
			if (!factory.$workers.includes(entity)) {
				if (factory.$workers.length >= factory.options.maxWorkers) {
					// Aww shucks, somebody else took our spot before we could make it to the factory!
					throw new Error(`The job was already taken by somebody else when ${entity} arrived`);
				}
				await factory.$workers.add(entity);
				entity.$$location.once(async () => {
					await factory.$workers.remove(entity);
				});
			}
			await entity.$status.set(`Working in ${factory}`);

			// Finish job when one work cycle completes
			await new Promise<void>((resolve) => {
				factory.$$progress.onceAbove(1, () => resolve(), true);
			});
		},
	),
	new ExecutionNode('Unset status', async ({ entity }) => {
		await entity.$status.set(null);
	}),
);

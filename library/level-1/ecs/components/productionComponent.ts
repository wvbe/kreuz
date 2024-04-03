import { Collection } from '../../events/Collection.ts';
import { EventedValue } from '../../events/EventedValue.ts';
import { ProgressingNumericValue } from '../../events/ProgressingNumericValue.ts';
import { Blueprint, SaveBlueprintJson } from './productionComponent/Blueprint.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';
import { EcsEntity } from '../types.ts';
import { type locationComponent } from './locationComponent.ts';
import { type statusComponent } from './statusComponent.ts';
import { type pathingComponent } from './pathingComponent.ts';
import { healthComponent } from './healthComponent.ts';

export type ProductionComponentWorkerEntity = EcsEntity<
	| typeof statusComponent
	| typeof locationComponent
	| typeof pathingComponent
	| typeof healthComponent
>;

/**
 * A component that allows an entity to produce something.
 */
export const productionComponent = new EcsComponent<
	{
		blueprint: Blueprint | null;
		maxWorkers: number;
	},
	{
		/**
		 * The maximum amount of workers that can work on this production component.
		 */
		maxWorkers: number;
		/**
		 * The {@link Collection} of workers that are currently participating.
		 */
		$workers: Collection<ProductionComponentWorkerEntity>;
		/**
		 * The manufacturing recipe that this entity is currently working on.
		 */
		blueprint: EventedValue<Blueprint | null>;
		/**
		 * The progress towards finishing one more production cycle. 0 means not started, 1 means finished.
		 */
		$$progress: ProgressingNumericValue;
	}
>(
	(entity) =>
		entity.blueprint instanceof EventedValue &&
		entity.$workers instanceof Collection &&
		entity.$$progress instanceof ProgressingNumericValue,
	(entity, options) => {
		entity.maxWorkers = options.maxWorkers;
		entity.$workers = new Collection<EcsEntity>();
		entity.blueprint = new EventedValue<Blueprint | null>(
			options.blueprint,
			`productionComponent blueprint`,
			{
				toJson: (context, current) =>
					current
						? // Return a registry reference if it exists, or serialize the JSON object for that blueprint
						  context.blueprints.key(current, false) || current.toSaveJson(context)
						: null,
				fromJson: async (context, saved) =>
					saved
						? typeof saved === 'string'
							? context.blueprints.get(saved as string)
							: Blueprint.fromSaveJson(context, saved as SaveBlueprintJson)
						: null,
			},
		);
		entity.$$progress = new ProgressingNumericValue(
			0,
			{ min: 0, max: 1, delta: 0 },
			`productionComponent $$progress`,
		);
	},
);

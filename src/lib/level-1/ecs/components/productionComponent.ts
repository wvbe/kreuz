import { Collection } from '../../events/Collection';
import { EventedValue } from '../../events/EventedValue';
import { ProgressingNumericValue } from '../../events/ProgressingNumericValue';
import { EcsComponent } from '../classes/EcsComponent';
import { EcsEntity } from '../types';
import { type eventLogComponent } from './eventLogComponent';
import { healthComponent } from './healthComponent';
import { type locationComponent } from './locationComponent';
import { type pathingComponent } from './pathingComponent';
import { Blueprint } from './productionComponent/Blueprint';

export type ProductionComponentWorkerEntity = EcsEntity<
	typeof locationComponent | typeof pathingComponent | typeof healthComponent,
	typeof eventLogComponent
>;

/**
 * A component that allows an entity to produce something.
 */
export const productionComponent = new EcsComponent<
	{
		blueprint: Blueprint | null;
		maxWorkers: number;
		/**
		 * A callback to fire when a production cycle is complete.
		 */
		onComplete?: () => Promise<void>;
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

		/**
		 * A callback to fire when a production cycle is complete.
		 */
		onComplete?: () => Promise<void>;
	}
>(
	(entity) =>
		entity.blueprint instanceof EventedValue &&
		entity.$workers instanceof Collection &&
		entity.$$progress instanceof ProgressingNumericValue,
	(entity, options) => {
		entity.onComplete = options.onComplete;
		entity.maxWorkers = options.maxWorkers;
		entity.$workers = new Collection<EcsEntity>();
		entity.blueprint = new EventedValue<Blueprint | null>(
			options.blueprint,
			`productionComponent blueprint`,
		);
		entity.$$progress = new ProgressingNumericValue(
			0,
			{ min: 0, max: 1, delta: 0 },
			`productionComponent $$progress`,
		);
	},
);

import { EcsComponent } from '../classes/EcsComponent.ts';
import { ProgressingNumericValue } from '../../events/ProgressingNumericValue.ts';
import { EcsEntity } from '../types.ts';
import { Event } from '../../events/Event.ts';

/**
 * Entities with the health component have a health value, and may die when it reaches zero.
 */
export const healthComponent = new EcsComponent<
	{ health: number },
	{
		/**
		 * Describes the health of the entity. 0 means dead, 1 means full health.
		 *
		 * If your process depends on a healthy entity, be sure to listen to the
		 * {@link EcsEntity<typeof healthComponent>.$death} event.
		 */
		health: ProgressingNumericValue;
		/**
		 * Emitted when the entity dies. Processes that are dependent on alive entities should listen
		 * and handle this event.
		 */
		$death: Event;
	}
>(
	(entity) => entity.health instanceof ProgressingNumericValue && entity.$death instanceof Event,
	(entity, options) => {
		const health = new ProgressingNumericValue(
			options.health,
			{ delta: 0, granularity: 0.01, min: 0, max: 1 },
			'healthComponent health',
		);
		const $death = new Event('healthComponent $death');

		$death.on(() => {
			console.log(`${entity} died`);
		});

		Object.assign(entity, {
			health,
			$death,
		});
	},
);

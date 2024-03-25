import { EventedValue } from '../../events/EventedValue.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

/**
 * Entities with this component have a status string.
 */
export const statusComponent = new EcsComponent<
	{ status?: string },
	{
		/**
		 * The status of the entity as an arbitrary string or `null`
		 */
		$status: EventedValue<string | null>;
	}
>(
	(entity) => entity.$status instanceof EventedValue,
	(entity, options) => {
		Object.assign(entity, {
			$status: new EventedValue(options.status || null, 'statusComponent $status'),
		});
	},
);

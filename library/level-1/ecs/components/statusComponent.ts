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
		const $status = new EventedValue(options.status || null, 'statusComponent $status');
		// $status.on(() => {
		// 	console.log(`${(entity as any).name}\t"${$status.get()}"`);
		// });
		Object.assign(entity, { $status });
	},
);

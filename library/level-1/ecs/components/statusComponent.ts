import { EventedValue } from '../../events/EventedValue.ts';
import { StackedEventedValue } from '../../events/StackedEventedValue.ts';
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
		$status: StackedEventedValue<string | null>;
	}
>(
	(entity) => entity.$status instanceof StackedEventedValue,
	(entity, options) => {
		const $status = new StackedEventedValue(options.status || null, 'statusComponent $status');
		// $status.on(() => {
		// 	console.log(`${(entity as any).name}\t"${$status.get()}"`);
		// });
		Object.assign(entity, { $status });
	},
);

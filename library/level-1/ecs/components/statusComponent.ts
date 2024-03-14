import { EventedValue } from '../../events/EventedValue.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

export const statusComponent = new EcsComponent<
	{ status?: string },
	{ $status: EventedValue<string | null> }
>(
	(entity) => entity.$status instanceof EventedValue,
	(entity, options) => {
		Object.assign(entity, {
			$status: new EventedValue(options.status || null, 'statusComponent $status'),
		});
	},
);

import { Collection } from '../../events/Collection';
import { EcsComponent } from '../classes/EcsComponent';

/**
 * Entities with this component have a status string.
 */
export const eventLogComponent = new EcsComponent<
	{ initialLog?: string[] },
	{
		events: Collection<string>;
	}
>(
	(entity) => entity.events instanceof Collection,
	(entity, options) => {
		const events = new Collection<string>();
		if (options.initialLog) {
			events.add(...options.initialLog);
		}
		Object.assign(entity, { events });
	},
);

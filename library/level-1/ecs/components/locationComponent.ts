import { EventedValue } from '../../events/EventedValue.ts';
import { Coordinate } from '../../terrain/Coordinate.ts';
import { CoordinateI } from '../../types.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

/**
 * Entities with this component have a location in the world.
 */
export const locationComponent = new EcsComponent<
	{ location: [number, number, number] },
	{
		/**
		 * The location of the entity in the world as a {@link CoordinateI}.
		 */
		$$location: EventedValue<CoordinateI>;
	}
>(
	(entity) => entity.$$location instanceof EventedValue,
	(entity, options) => {
		Object.assign(entity, {
			$$location: new EventedValue(
				new Coordinate(...options.location),
				'locationComponent $$location',
			),
		});
	},
);

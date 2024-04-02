import { EventedValue } from '../../events/EventedValue.ts';
import { SimpleCoordinate } from '../../terrain/types.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

/**
 * Entities with this component have a location in the world.
 */
export const locationComponent = new EcsComponent<
	{ location: SimpleCoordinate },
	{
		/**
		 * The location of the entity in the world as a {@link SimpleCoordinate}.
		 */
		location: EventedValue<SimpleCoordinate>;
		equalsMapLocation(other: SimpleCoordinate): boolean;
		euclideanDistanceTo(other: SimpleCoordinate): number;
	}
>(
	(entity) => entity.location instanceof EventedValue,
	(entity, options) => {
		const location = new EventedValue(options.location, 'locationComponent location');

		entity.location = location;

		entity.equalsMapLocation = (other: SimpleCoordinate): boolean => {
			const [x1, y1] = location.get();
			const [x2, y2] = other;
			return x1 === x2 && y1 === y2;
		};

		entity.euclideanDistanceTo = (other: SimpleCoordinate): number => {
			const [x1, y1, z1] = location.get();
			const [x2, y2, z2] = other;
			const xy = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
			const xyz = Math.sqrt(xy ** 2 + (z1 - z2) ** 2);
			return xyz;
		};
	},
);

import { EventedValue } from '../../events/EventedValue.ts';
import { Coordinate } from '../../terrain/Coordinate.ts';
import { SimpleCoordinate, CoordinateI } from '../../terrain/types.ts';
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
		equalsMapLocation(other: SimpleCoordinate): boolean;
		euclideanDistanceTo(other: SimpleCoordinate): number;
	}
>(
	(entity) => entity.$$location instanceof EventedValue,
	(entity, options) => {
		const location = new EventedValue(
			new Coordinate(...options.location),
			'locationComponent $$location',
		);

		entity.$$location = location;

		entity.equalsMapLocation = (other: SimpleCoordinate): boolean => {
			const { x, y } = location.get();
			const [otherX, otherY] = other;
			return x === otherX && y === otherY;
		};

		entity.euclideanDistanceTo = (other: SimpleCoordinate): number => {
			const { x, y, z } = location.get();
			const [otherX, otherY, otherZ] = other;
			const xy = Math.sqrt((x - otherX) ** 2 + (y - otherY) ** 2);
			const xyz = Math.sqrt(xy ** 2 + (z - otherZ) ** 2);
			return xyz;
		};
	},
);

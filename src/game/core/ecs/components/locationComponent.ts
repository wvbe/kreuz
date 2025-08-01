import { EventedValue } from '../../events/EventedValue';
import { QualifiedCoordinate } from '../../terrain/types';
import { EcsComponent } from '../classes/EcsComponent';
import { getEuclideanMapDistanceAcrossSpaces } from './location/getEuclideanMapDistanceAcrossSpaces';
import { isMapLocationEqualTo } from './location/isMapLocationEqualTo';

/**
 * Entities with this component have a location in the world.
 */
export const locationComponent = new EcsComponent<
	{ location: QualifiedCoordinate },
	{
		/**
		 * The location of the entity in the world as a {@link QualifiedCoordinate}.
		 */
		location: EventedValue<QualifiedCoordinate>;
		/**
		 * Whether the current entity is at the same location as a given {@link QualifiedCoordinate}.
		 */
		equalsMapLocation(other: QualifiedCoordinate): boolean;
		/**
		 * Distance between the current entity and a given {@link QualifiedCoordinate}, "as the crow flies". Uses
		 * Pythagoras, and will travel in and out of nested spaces if the two coordinates are in different
		 * spaces.
		 */
		euclideanDistanceTo(other: QualifiedCoordinate): number;
	}
>(
	(entity) => entity.location instanceof EventedValue,
	(entity, options) => {
		const location = new EventedValue(options.location, 'locationComponent location');

		entity.location = location;

		entity.equalsMapLocation = (other: QualifiedCoordinate): boolean =>
			isMapLocationEqualTo(location.get(), other);

		entity.euclideanDistanceTo = (other: QualifiedCoordinate): number =>
			getEuclideanMapDistanceAcrossSpaces(location.get(), other);
	},
);

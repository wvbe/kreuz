import { EventedValue } from '../../events/EventedValue';
import { QualifiedCoordinate } from '../../terrain/types';
import { EcsComponent } from '../classes/EcsComponent';
import { getEuclideanDistanceAcrossSpaces } from './location/getEuclideanDistanceAcrossSpaces';

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

		entity.equalsMapLocation = (other: QualifiedCoordinate): boolean => {
			const [space1, x1, y1] = location.get();
			const [space2, x2, y2] = other;
			return space1 === space2 && x1 === x2 && y1 === y2;
		};

		entity.euclideanDistanceTo = (other: QualifiedCoordinate): number =>
			getEuclideanDistanceAcrossSpaces(location.get(), other);
	},
);

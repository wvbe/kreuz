import { SimpleCoordinate } from '../../terrain/types';
import { EcsComponent } from '../classes/EcsComponent';

/**
 * Entities with this component have an outline or shape when you'd look at them.
 */
export const outlineComponent = new EcsComponent<{
	outlineCoordinates: SimpleCoordinate[];
}>((entity) => Array.isArray(entity.outlineCoordinates));

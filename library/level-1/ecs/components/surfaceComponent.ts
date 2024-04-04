import { EventedValue } from '../../events/EventedValue.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

export enum SurfaceType {
	/**
	 * The surface is unknown, it is dark, cannot build or walk here.
	 */
	UNKNOWN,
	/**
	 * The surface is open, entities can walk here.
	 */
	OPEN,
}

/**
 * Entities with this component have a (walkable?) surface.
 */
export const surfaceComponent = new EcsComponent<
	{ surfaceType: SurfaceType },
	{ surfaceType: EventedValue<SurfaceType> }
>(
	(entity) => entity.surfaceType instanceof EventedValue,
	(entity, options) => {
		const surfaceType = new EventedValue<SurfaceType>(
			options.surfaceType,
			'surfaceComponent surfaceType',
		);

		entity.surfaceType = surfaceType;
	},
);

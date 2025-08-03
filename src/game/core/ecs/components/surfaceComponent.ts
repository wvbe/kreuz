import { EventedValue } from '../../events/EventedValue';
import { EcsComponent } from '../classes/EcsComponent';

export enum SurfaceType {
	/**
	 * The surface is unknown, it is dark, cannot build or walk here.
	 */
	UNKNOWN,
	/**
	 * The surface is a shallow water, entities cannot walk here but we can place jobs here
	 */
	SHALLOW_WATER,
	/**
	 * The surface is open, entities can walk here.
	 */
	OPEN,
}

/**
 * Say stuff about the surface, because
 */
export const surfaceComponent = new EcsComponent<
	{ surfaceType: SurfaceType | null },
	{ surfaceType: EventedValue<SurfaceType | null> }
>(
	(entity) => entity.surfaceType instanceof EventedValue,
	(entity, options) => {
		const surfaceType = new EventedValue<SurfaceType | null>(
			options.surfaceType,
			'surfaceComponent surfaceType',
		);

		entity.surfaceType = surfaceType;
	},
);

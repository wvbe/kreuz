import { TerrainDefinition } from '../../../assets/terrains';
import { EventedValue } from '../../events/EventedValue';
import { EcsComponent } from '../classes/EcsComponent';

/**
 * Say stuff about the surface, because
 */
export const surfaceComponent = new EcsComponent<
	{ surfaceType: TerrainDefinition | null },
	{ surfaceType: EventedValue<TerrainDefinition | null> }
>(
	(entity) => entity.surfaceType instanceof EventedValue,
	(entity, options) => {
		const surfaceType = new EventedValue<TerrainDefinition | null>(
			options.surfaceType,
			'surfaceComponent surfaceType',
		);
		entity.surfaceType = surfaceType;
	},
);

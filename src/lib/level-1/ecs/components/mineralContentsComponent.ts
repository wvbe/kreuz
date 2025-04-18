import { EventedValue } from '../../events/EventedValue';
import { SimpleCoordinate } from '../../terrain/types';
import { EcsComponent } from '../classes/EcsComponent';
import {
	getMaterialDistribution,
	MaterialDistribution,
} from './surfaceComponent/materialDistribution';

/**
 * Entities with this component are made of a mineral, stone, etc.
 */
export const mineralContentsComponent = new EcsComponent<
	{ location: SimpleCoordinate },
	{ materialDistribution: EventedValue<MaterialDistribution> }
>(
	(entity) => entity.materialDistribution instanceof EventedValue,
	(entity, options) => {
		const materialDistribution = new EventedValue<MaterialDistribution>(
			getMaterialDistribution(options.location[0], options.location[1]),
			'mineralContentsComponent materialDistribution',
		);

		entity.materialDistribution = materialDistribution;
	},
);

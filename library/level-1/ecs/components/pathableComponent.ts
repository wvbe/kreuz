import { EcsEntity } from '../types.ts';
import { CoordinateI } from '../../terrain/types.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';
import { EcsSystem } from '../classes/EcsSystem.ts';

/**
 * Entities with this component can be walked over, and (so long as they are connected to other
 * pathable entities) can be used to pathfind.
 */
export const pathableComponent = new EcsComponent<
	{
		/**
		 * 1 = very easily walkable
		 * 0 = you cannot actually walk here
		 */
		walkability: number;
	},
	{
		walkability: number;
		pathingNeighbours: EcsEntity[];
	}
>(
	(entity) => typeof entity.walkability === 'number',
	(entity, options) => {
		entity.walkability = options.walkability;
		entity.pathingNeighbours = [];
	},
);

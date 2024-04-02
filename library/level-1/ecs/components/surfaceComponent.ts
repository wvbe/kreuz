import { EcsComponent } from '../classes/EcsComponent.ts';

/**
 * Entities with this component have a (walkable?) surface.
 */
export const surfaceComponent = new EcsComponent<{ surfaceColor: string }>(
	(entity) => typeof entity.surfaceColor === 'string',
);

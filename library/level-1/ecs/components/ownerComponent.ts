import { EcsComponent } from '../classes/EcsComponent.ts';
import { EcsEntity } from '../types.ts';
import { inventoryComponent } from './inventoryComponent.ts';
import { wealthComponent } from './wealthComponent.ts';

/**
 * Entities with this component have an owner who may be happy or sad depending on what happens with their property.
 */
export const ownerComponent = new EcsComponent<{
	/**
	 * The entity that owns this entity.
	 */
	owner: EcsEntity<typeof wealthComponent | typeof inventoryComponent>;
}>(
	(entity) =>
		!!entity.owner &&
		wealthComponent.test(entity.owner as EcsEntity) &&
		inventoryComponent.test(entity.owner as EcsEntity),
);

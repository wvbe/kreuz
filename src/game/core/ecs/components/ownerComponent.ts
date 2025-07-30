import { EcsComponent } from '../classes/EcsComponent';
import { EcsEntity } from '../types';
import { inventoryComponent } from './inventoryComponent';
import { wealthComponent } from './wealthComponent';

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

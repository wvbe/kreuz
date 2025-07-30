import { MaterialState } from '../../inventory/types';
import { EcsComponent } from '../classes/EcsComponent';
import { inventoryComponent } from './inventoryComponent';

/**
 * Entities with this component are requesting transport for materials that they either lack, or
 * have in surplus.
 */
export const importExportComponent = new EcsComponent<{
	/**
	 * The materials and amount of that need to be exceeded of them before the entity will start
	 * providing them to other entities.
	 */
	provideMaterialsWhenAbove: MaterialState[];
	/**
	 * The materials and amount of that need to be unmet of them before the entity will start
	 * requesting them from other entities.
	 */
	requestMaterialsWhenBelow: MaterialState[];
}>(
	(entity) =>
		Array.isArray(entity.provideMaterialsWhenAbove) &&
		Array.isArray(entity.requestMaterialsWhenBelow) &&
		inventoryComponent.test(entity),
);

import { MaterialState } from '../../inventory/types';
import { EcsComponent } from '../classes/EcsComponent';

/**
 * Entities with this component would sell their grandmother to you.
 */
export const vendorComponent = new EcsComponent<{
	sellMaterialsWhenAbove: MaterialState[];
	profitMargin: number;
}>((entity) => Array.isArray(entity.sellMaterialsWhenAbove) && entity.profitMargin !== undefined);

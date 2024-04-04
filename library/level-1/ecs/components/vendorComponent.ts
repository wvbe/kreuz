import { MaterialState } from '../../inventory/types.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

/**
 * Entities with this component would sell their grandmother to you.
 */
export const vendorComponent = new EcsComponent<{
	sellMaterialsWhenAbove: MaterialState[];
	profitMargin: number;
}>((entity) => Array.isArray(entity.sellMaterialsWhenAbove) && entity.profitMargin !== undefined);

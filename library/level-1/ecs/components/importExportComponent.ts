import { MaterialState } from '../../inventory/types.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';
import { inventoryComponent } from './inventoryComponent.ts';

export const importExportComponent = new EcsComponent<{
	sellMaterialsWhenAbove: MaterialState[];
	buyMaterialsWhenBelow: MaterialState[];
}>(
	(entity) =>
		inventoryComponent.test(entity) &&
		Array.isArray(entity.sellMaterialsWhenAbove) &&
		Array.isArray(entity.buyMaterialsWhenBelow),
);

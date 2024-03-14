import { Material } from '../../inventory/Material.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';
import { inventoryComponent } from './inventoryComponent.ts';

export const resellerComponent = new EcsComponent<{ materials: Material[] }>(
	(entity) => Array.isArray(entity.materials) && inventoryComponent.test(entity),
);

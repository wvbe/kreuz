import { Inventory } from '../../inventory/Inventory.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

export const inventoryComponent = new EcsComponent<
	{
		maxStackSpace: number;
	},
	{
		inventory: Inventory;
	}
>(
	(entity) => entity.inventory instanceof Inventory,
	(entity, options) => {
		entity.inventory = new Inventory(options.maxStackSpace);
	},
);

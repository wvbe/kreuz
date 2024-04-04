import { Inventory } from './inventoryComponent/Inventory.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';
import { MaterialState } from '../../inventory/types.ts';

/**
 * Entities with this component have a capacity to carry materials around.
 */
export const inventoryComponent = new EcsComponent<
	{
		/**
		 * The maximum amount of stacks that this entity can hold in inventory.
		 */
		maxStackSpace: number;
		availableItems?: MaterialState[];
	},
	{
		/**
		 * The {@link Inventory} that this entity has on them.
		 */
		inventory: Inventory;
	}
>(
	(entity) => entity.inventory instanceof Inventory,
	(entity, options) => {
		const inventory = new Inventory(options.maxStackSpace);

		if (options.availableItems) {
			inventory.changeMultiple(options.availableItems, true);
		}

		entity.inventory = inventory;
	},
);

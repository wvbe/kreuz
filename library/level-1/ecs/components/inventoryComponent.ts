import { Inventory } from './inventoryComponent/Inventory.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

/**
 * Entities with this component have a capacity to carry materials around.
 */
export const inventoryComponent = new EcsComponent<
	{
		/**
		 * The maximum amount of stacks that this entity can hold in inventory.
		 */
		maxStackSpace: number;
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
		entity.inventory = new Inventory(options.maxStackSpace);
	},
);

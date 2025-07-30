import React from 'react';
import { inventoryComponent } from '../../../game/core/ecs/components/inventoryComponent';
import { wealthComponent } from '../../../game/core/ecs/components/wealthComponent';
import { EcsEntity } from '../../../game/core/ecs/types';
import { GameInventory } from '../GameInventory';

/**
 * A React component that displays information about the inventory component of an entity.
 *
 * @param entity - The entity with an inventory component.
 *
 * @returns A JSX element displaying the inventory component details.
 *
 * @see {@link inventoryComponent}
 */
const InventoryTab: React.FC<{
	entity: EcsEntity<typeof inventoryComponent, typeof wealthComponent>;
}> = ({ entity }) => {
	return <GameInventory inventory={entity.inventory} wallet={entity.wallet} />;
};

export default InventoryTab;

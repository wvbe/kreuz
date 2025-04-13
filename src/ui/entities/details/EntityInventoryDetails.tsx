import React, { FunctionComponent } from 'react';

import { InventoryUI } from '../../inventory/InventoryUI';
import { inventoryComponent } from 'src/lib/level-1/ecs/components/inventoryComponent';
import { wealthComponent } from 'src/lib/level-1/ecs/components/wealthComponent';
import { EcsEntity } from 'src/lib/level-1/ecs/types';

export const EntityInventoryDetails: FunctionComponent<{
	entity: EcsEntity;
}> = ({ entity }) => {
	const inventory = (entity as EcsEntity<typeof inventoryComponent>).inventory;
	if (!inventory) {
		return null;
	}
	return (
		<InventoryUI
			inventory={inventory}
			wallet={(entity as EcsEntity<typeof wealthComponent>).wallet}
		/>
	);
};

import React, { FunctionComponent } from 'react';

import { inventoryComponent } from '../../../lib/level-1/ecs/components/inventoryComponent';
import { wealthComponent } from '../../../lib/level-1/ecs/components/wealthComponent';
import { EcsEntity } from '../../../lib/level-1/ecs/types';
import { InventoryUI } from '../../inventory/InventoryUI';

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

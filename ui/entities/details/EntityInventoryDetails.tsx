import React, { FunctionComponent } from 'react';

import { EcsEntity, inventoryComponent, wealthComponent } from '@lib';
import { InventoryUI } from '../../inventory/InventoryUI.tsx';

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

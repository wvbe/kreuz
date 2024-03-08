import { EntityI, PersonEntity } from '@lib';
import React, { FunctionComponent } from 'react';

import { InventoryUI } from '../../inventory/InventoryUI.tsx';

export const EntityInventoryDetails: FunctionComponent<{ entity: EntityI }> = ({ entity }) => {
	const inventory = (entity as PersonEntity).inventory;
	if (!inventory) {
		return null;
	}
	return <InventoryUI inventory={inventory} wallet={(entity as PersonEntity).wallet} />;
};

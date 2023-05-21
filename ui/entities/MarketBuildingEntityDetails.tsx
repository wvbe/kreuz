import { MarketBuildingEntity } from '@lib';
import React, { FunctionComponent } from 'react';

import { InventoryUI } from '../inventory/InventoryUI.tsx';

export const MarketBuildingEntityDetails: FunctionComponent<{ entity: MarketBuildingEntity }> = ({
	entity,
}) => {
	return (
		<article className="entity-details">
			<InventoryUI inventory={entity.inventory} />
		</article>
	);
};

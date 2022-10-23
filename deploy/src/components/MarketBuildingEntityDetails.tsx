import { MarketBuildingEntity } from '@lib';
import { FunctionComponent } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { InventoryUI } from './InventoryUI.tsx';

export const MarketBuildingEntityDetails: FunctionComponent<{ entity: MarketBuildingEntity }> = ({
	entity,
}) => {
	return (
		<article className="entity-details">
			<InventoryUI inventory={entity.inventory} />
		</article>
	);
};

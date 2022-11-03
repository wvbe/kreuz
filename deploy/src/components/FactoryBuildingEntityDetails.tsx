import { FactoryBuildingEntity, PersonEntity } from '@lib';
import { FunctionComponent } from 'react';
import { useEventData, useEventedValue } from '../hooks/useEventedValue.ts';
import { FillBar } from './atoms/FillBar.tsx';
import { InventoryUI } from './InventoryUI.tsx';

export const FactoryBuildingEntityDetails: FunctionComponent<{ entity: FactoryBuildingEntity }> = ({
	entity,
}) => {
	const workers = useEventData<[PersonEntity[], PersonEntity[]], number>(
		entity.$workers.$change,
		entity.$workers.length,
		() => entity.$workers.length,
	);
	const blueprint = useEventedValue(entity.$blueprint);
	const progress = useEventedValue(entity.$$progress);

	return (
		<article className="entity-details">
			<p>
				Workers: {workers} out of {entity.options.maxWorkers}
			</p>
			{blueprint ? (
				<FillBar
					ratio={progress}
					label={'Production'}
					labelRight={`${Math.round(progress * 100)}%`}
				/>
			) : (
				<p>No blueprint</p>
			)}
			<InventoryUI inventory={entity.inventory} />
		</article>
	);
};

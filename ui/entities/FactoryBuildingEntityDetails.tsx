import { FactoryBuildingEntity, PersonEntity, Collection } from '@lib';
import React, { FunctionComponent } from 'react';
import { useEventData, useEventedValue } from '../hooks/useEventedValue.ts';
import { FillBar } from '../components/atoms/FillBar.tsx';
import { InventoryUI } from '../inventory/InventoryUI.tsx';
import { BlueprintBadge } from '../components/BlueprintBadge.tsx';
import { EntityLink } from '../entities/EntityLink.tsx';
export const FactoryBuildingEntityDetails: FunctionComponent<{ entity: FactoryBuildingEntity }> = ({
	entity,
}) => {
	const workers = useEventData<[PersonEntity[], PersonEntity[]], PersonEntity[]>(
		entity.$workers.$change,
		entity.$workers.slice(),
		() => entity.$workers.slice(),
	);
	const blueprint = useEventedValue(entity.$blueprint);
	const progress = useEventedValue(entity.$$progress);

	return (
		<article className="entity-details">
			<p>
				Workers: {workers.length} out of {entity.options.maxWorkers}
			</p>
			{workers.length ? (
				<ul>
					{workers.map((worker) => (
						<li key={worker.id}>
							<EntityLink entity={worker} />
						</li>
					))}
				</ul>
			) : null}
			{blueprint ? (
				<FillBar
					ratio={progress}
					label={blueprint.name}
					labelRight={`${Math.round(progress * 100)}%`}
				/>
			) : (
				<p>No blueprint</p>
			)}
			<BlueprintBadge blueprint={blueprint} />
			<InventoryUI inventory={entity.inventory} />
		</article>
	);
};

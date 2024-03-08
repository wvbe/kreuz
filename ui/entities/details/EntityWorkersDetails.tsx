import { EntityI, FactoryBuildingEntity, PersonEntity } from '@lib';
import React, { FunctionComponent } from 'react';
import { useEventData } from '../../hooks/useEventedValue.ts';
import { EntityLink } from '../EntityLink.tsx';

export const EntityWorkersDetails: FunctionComponent<{ entity: EntityI }> = ({ entity }) => {
	const $workers = (entity as FactoryBuildingEntity).$workers;
	if (!$workers) {
		return null;
	}
	const workers = useEventData<[PersonEntity[], PersonEntity[]], PersonEntity[]>(
		$workers.$change,
		$workers.slice(),
		() => $workers.slice(),
	);

	return (
		<>
			<p>
				Workers: {workers.length} out of {(entity as FactoryBuildingEntity).options.maxWorkers}
			</p>
			<ul>
				{workers.map((worker) => (
					<li key={worker.id}>
						<EntityLink entity={worker} />
					</li>
				))}
			</ul>
		</>
	);
};

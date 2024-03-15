import { EcsEntity, productionComponent, visibilityComponent } from '@lib';
import React, { FunctionComponent } from 'react';
import { useMemoFromEvent } from '../../hooks/useEventedValue.ts';
import { EntityLink } from '../EntityLink.tsx';

export const EntityWorkersDetails: FunctionComponent<{ entity: EcsEntity }> = ({ entity }) => {
	const $workers = (entity as EcsEntity<typeof productionComponent>).$workers;
	if (!$workers) {
		return null;
	}
	const workers = useMemoFromEvent($workers.$change, $workers.slice(), () => $workers.slice());

	return (
		<>
			<p>
				Workers: {workers.length} out of{' '}
				{(entity as EcsEntity<typeof productionComponent>).maxWorkers}
			</p>
			<ul>
				{workers
					.filter((entity) => visibilityComponent.test(entity))
					.map((worker) => (
						<li key={worker.id}>
							<EntityLink
								entity={
									// STFU TypeScript
									worker as unknown as EcsEntity<typeof visibilityComponent>
								}
							/>
						</li>
					))}
			</ul>
		</>
	);
};

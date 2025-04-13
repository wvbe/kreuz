import React, { FunctionComponent, useCallback } from 'react';
import { productionComponent } from '../../../lib/level-1/ecs/components/productionComponent';
import { visibilityComponent } from '../../../lib/level-1/ecs/components/visibilityComponent';
import { EcsEntity } from '../../../lib/level-1/ecs/types';
import { useMemoFromEvent } from '../../hooks/useEventedValue';
import { EntityLink } from '../EntityLink';

export const EntityWorkersDetails: FunctionComponent<{ entity: EcsEntity }> = ({ entity }) => {
	const $workers = (entity as EcsEntity<typeof productionComponent>).$workers;

	const transform = useCallback(() => $workers?.slice(), []);
	const workers = useMemoFromEvent($workers?.$change, $workers?.slice(), transform);
	if (!$workers) {
		return null;
	}
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

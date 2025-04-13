import React, { FunctionComponent } from 'react';
import { FillBar } from '../../components/atoms/FillBar';
import { useEventedValue } from '../../hooks/useEventedValue';
import { productionComponent } from 'src/lib/level-1/ecs/components/productionComponent';
import { EcsEntity } from 'src/lib/level-1/ecs/types';

export const EntityBlueprintProgressDetails: FunctionComponent<{
	entity: EcsEntity;
}> = ({ entity }) => {
	const $blueprint = (entity as EcsEntity<typeof productionComponent>).blueprint;
	const $$progress = (entity as EcsEntity<typeof productionComponent>).$$progress;
	if (!$blueprint || !$$progress) {
		return null;
	}
	const blueprint = useEventedValue($blueprint);
	const progress = useEventedValue($$progress);

	return blueprint ? (
		<FillBar
			ratio={progress}
			label={blueprint.name}
			labelRight={`${Math.round(progress * 100)}%`}
		/>
	) : (
		<p>No blueprint</p>
	);
};

import { EcsEntity, productionComponent } from '@lib';
import React, { FunctionComponent } from 'react';
import { FillBar } from '../../components/atoms/FillBar.tsx';
import { useEventedValue } from '../../hooks/useEventedValue.ts';

export const EntityBlueprintProgressDetails: FunctionComponent<{
	entity: EcsEntity;
}> = ({ entity }) => {
	const $blueprint = (entity as EcsEntity<typeof productionComponent>).$blueprint;
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

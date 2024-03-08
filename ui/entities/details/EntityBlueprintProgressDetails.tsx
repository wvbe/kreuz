import { EntityI, FactoryBuildingEntity } from '@lib';
import React, { FunctionComponent } from 'react';
import { FillBar } from '../../components/atoms/FillBar.tsx';
import { useEventedValue } from '../../hooks/useEventedValue.ts';

export const EntityBlueprintProgressDetails: FunctionComponent<{ entity: EntityI }> = ({
	entity,
}) => {
	const $blueprint = (entity as FactoryBuildingEntity).$blueprint;
	const $$progress = (entity as FactoryBuildingEntity).$$progress;
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

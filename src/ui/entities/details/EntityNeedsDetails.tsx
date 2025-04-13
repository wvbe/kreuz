import React, { FunctionComponent, useMemo } from 'react';

import { PERSON_NEEDS } from '../../../lib/level-1/constants/needs';
import { needsComponent } from '../../../lib/level-1/ecs/components/needsComponent';
import { EcsEntity } from '../../../lib/level-1/ecs/types';
import { Need } from '../../../lib/level-1/entities/Need';
import { FillBar } from '../../components/atoms/FillBar';
import { useEventedValue } from '../../hooks/useEventedValue';

const PersonEntityNeed: FunctionComponent<{ need: Need }> = ({ need }) => {
	const value = useEventedValue(need);
	const config = useMemo(() => PERSON_NEEDS.find((config) => config.id === need.id), [need.id]);
	const range = useMemo(
		() =>
			config?.moods.find(
				(item, i, all) =>
					value > (all[i - 1]?.upUntil || -Infinity) && value < item.upUntil,
			),
		[config, value],
	);
	return (
		<FillBar
			ratio={value}
			label={need.label}
			labelRight={`${range?.label || ''} ${Math.round(value * 100)}%`}
		/>
	);
};

export const EntityNeedsDetails: FunctionComponent<{ entity: EcsEntity }> = ({ entity }) => {
	const needs = (entity as EcsEntity<typeof needsComponent>).needs;
	if (!needs) {
		return null;
	}
	return (
		<>
			{Object.entries(needs).map(([key, need]) => (
				<PersonEntityNeed key={key} need={need} />
			))}
		</>
	);
};

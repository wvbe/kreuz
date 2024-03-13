import { EntityI, Need, PERSON_NEEDS, PersonEntity } from '@lib';
import React, { FunctionComponent, useMemo } from 'react';

import { FillBar } from '../../components/atoms/FillBar.tsx';
import { useEventedValue } from '../../hooks/useEventedValue.ts';

const PersonEntityNeed: FunctionComponent<{ need: Need }> = ({ need }) => {
	const value = useEventedValue(need);
	const config = useMemo(() => PERSON_NEEDS.find((config) => config.id === need.id), [need.id]);
	const range = useMemo(
		() =>
			config?.moods.find(
				(item, i, all) => value > (all[i - 1]?.upUntil || -Infinity) && value < item.upUntil,
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

export const EntityNeedsDetails: FunctionComponent<{ entity: EntityI }> = ({ entity }) => {
	const needs = (entity as PersonEntity).needs;
	if (!needs) {
		return null;
	}
	return (
		<>
			{needs.map((need, index) => (
				<PersonEntityNeed key={index} need={need} />
			))}
		</>
	);
};

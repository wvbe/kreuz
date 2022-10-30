import { PersonEntity, PERSON_NEEDS, Need } from '@lib';
import { FunctionComponent, useMemo } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { Badge } from './atoms/Badge.tsx';
import { FillBar } from './atoms/FillBar.tsx';
import { InventoryUI } from './InventoryUI.tsx';

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

export const PersonEntityDetails: FunctionComponent<{ entity: PersonEntity }> = ({ entity }) => {
	const needs = useMemo(
		() => entity.needs.map((need, index) => <PersonEntityNeed key={index} need={need} />),
		[entity],
	);
	return (
		<article className="entity-details">
			{needs}
			<InventoryUI inventory={entity.inventory} />
		</article>
	);
};

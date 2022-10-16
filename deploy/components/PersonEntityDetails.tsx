import { PersonEntity } from '@lib';
import { FunctionComponent, useEffect, useMemo } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { Need } from '../library/src/entities/Need.ts';
import { FillBar } from './atoms/FillBar.tsx';
import { Badge } from './atoms/Badge.tsx';

const PersonEntityNeed: FunctionComponent<{ need: Need }> = ({ need }) => {
	// useEffect(() => need.setPollingInterval(100), [need]);
	const value = useEventedValue(need);
	return <FillBar ratio={value} label={need.label} labelRight={`${Math.round(value * 100)}%`} />;
};

export const PersonEntityDetails: FunctionComponent<{ entity: PersonEntity }> = ({ entity }) => {
	const needs = useMemo(
		() => entity.needsList.map((need, index) => <PersonEntityNeed key={index} need={need} />),
		[entity],
	);
	return (
		<article className="entity-details">
			<Badge
				icon={entity.icon}
				title={entity.userData.firstName}
				subtitle={entity.job?.label || 'Idle'}
			/>
			{needs}
		</article>
	);
};

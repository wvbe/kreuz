import { FactoryBuildingEntity, PERSON_NEEDS, ProductionJob } from '@lib';
import { FunctionComponent, useMemo } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { Need } from '../library/src/entities/Need.ts';
import { Badge } from './atoms/Badge.tsx';
import { FillBar } from './atoms/FillBar.tsx';

const FactoryBuildingEntityNeed: FunctionComponent<{ need: Need }> = ({ need }) => {
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

const ProductionJobDetails: FunctionComponent<{ job: ProductionJob }> = ({ job }) => {
	const blueprint = useEventedValue(job.$$blueprint);
	const progress = useEventedValue(job.$$progress);

	if (!blueprint) {
		return <p>No blueprint</p>;
	}
	return (
		<FillBar ratio={progress} label={'Production'} labelRight={`${Math.round(progress * 100)}%`} />
	);
};

export const FactoryBuildingEntityDetails: FunctionComponent<{ entity: FactoryBuildingEntity }> = ({
	entity,
}) => {
	const job = useEventedValue(entity.$$job);

	return (
		<article className="entity-details">
			<Badge
				icon={entity.icon}
				title={
					// Snip off the customary emoji
					entity.label.substring(2)
				}
				subtitle={entity.$$job.get()?.label || 'Idle'}
			/>
			{job && <ProductionJobDetails job={job as ProductionJob} />}
		</article>
	);
};
